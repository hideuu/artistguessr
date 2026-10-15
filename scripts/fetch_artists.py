import datetime
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "artistguessr/0.1 (contact: andyhamon2005@gmail.com)"

SEED_ARTISTS = [
    # International pop
    "Taylor Swift",
    "The Weeknd",
    "Bruno Mars",
    "Billie Eilish",
    "Ariana Grande",
    "Ed Sheeran",
    "Dua Lipa",
    "Lady Gaga",
    "Justin Bieber",
    "Katy Perry",
    "Rihanna",
    "Beyoncé",
    "Adele",
    "Harry Styles",
    "Olivia Rodrigo",
    "Sabrina Carpenter",
    "Lana Del Rey",
    "Laufey",
    "Shawn Mendes",
    "Charlie Puth",

    # Hip-hop and R&B
    "Ye",
    "Eminem",
    "Drake",
    "Kendrick Lamar",
    "Travis Scott",
    "Tyler, the Creator",
    "Post Malone",
    "SZA",
    "Frank Ocean",
    "Childish Gambino",

    # International groups
    "BTS",
    "BLACKPINK",
    "TWICE",
    "NewJeans",
    "Stray Kids",
    "SEVENTEEN",
    "Radiohead",
    "Coldplay",
    "Imagine Dragons",
    "Maroon 5",
    "One Direction",
    "Queen",
    "The Beatles",
    "Linkin Park",
    "Nirvana",
    "The Vamps",

    # Popular Filipino artists
    "SB19",
    "Ben&Ben",
    "BINI",
    "Sarah Geronimo",
    "Moira Dela Torre",
    "Zack Tabudlo",
    "December Avenue",
    "Eraserheads",
    "IV of Spades",
    "Rivermaya",
]

# To test on just a few artists, remove the "#" at the start of the next line:
# SEED_ARTISTS = SEED_ARTISTS[:3]

# If the script picks the wrong artist, find the right one on
# musicbrainz.org, copy the ID from the URL, and add it here, e.g.:
#     "BTS": "paste-the-uuid-here",
MBID_OVERRIDES = {
}

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_FILE = PROJECT_ROOT / "public" / "data" / "artists.json"
MB_BASE = "https://musicbrainz.org/ws/2/"

# Order matters: the first keyword found in a MusicBrainz genre wins.
GENRE_KEYWORDS = [
    ("k-pop", "k-pop"), ("p-pop", "p-pop"), ("opm", "opm"),
    ("hip hop", "hip-hop"), ("hip-hop", "hip-hop"), ("rap", "hip-hop"),
    ("r&b", "r&b"), ("rhythm and blues", "r&b"), ("soul", "r&b"),
    ("metal", "metal"), ("rock", "rock"), ("indie", "indie"),
    ("folk", "folk"), ("country", "country"), ("pop", "pop"),
    ("electro", "electronic"), ("house", "electronic"),
    ("dance", "electronic"), ("jazz", "jazz"),
]


def mb_get(path, **params):
    """Call the MusicBrainz API with rate limiting and retries."""
    params["fmt"] = "json"
    url = MB_BASE + path + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})

    for attempt in range(5):
        time.sleep(1.1)  # MusicBrainz rate limit
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as error:
            if attempt == 4:
                raise
            wait = 5 * (attempt + 1)
            print(f"  retry in {wait}s ({error})")
            time.sleep(wait)


def pick_best(candidates, name):
    """Pick the best exact-name match when MusicBrainz has duplicates."""
    exact = [
        a for a in candidates
        if a.get("name", "").casefold() == name.casefold()
    ]
    if not exact:
        return None

    # Highest score first, then has a country, then no disambiguation.
    exact.sort(key=lambda a: (
        -a.get("score", 0),
        0 if a.get("country") else 1,
        1 if a.get("disambiguation") else 0,
    ))
    best = exact[0]

    if len(exact) > 1:
        note = best.get("disambiguation") or "no disambiguation"
        print(f"PICKED: {name} ({note}) -> "
              f"https://musicbrainz.org/artist/{best['id']}")
    return best


def search_artist(name):
    if name in MBID_OVERRIDES:
        data = mb_get(
            "artist/", query=f"arid:{MBID_OVERRIDES[name]}", limit=1
        )
        found = data.get("artists", [])
        artist = found[0] if found else None
    else:
        data = mb_get("artist/", query=f'artist:"{name}"', limit=10)
        artist = pick_best(data.get("artists", []), name)

    if not artist:
        print(f"NOT FOUND: {name}")
        return None

    artist_type = artist.get("type")

    if artist_type == "Person":
        game_type = "solo"
    elif artist_type == "Group":
        game_type = "group"
    else:
        game_type = None

    return {
        "id": f"mb_{artist['id']}",
        "musicbrainz_id": artist["id"],
        "name": artist["name"],
        "aliases": [],
        "country": artist.get("country"),
        "genres": [],
        "debut_year": None,
        "artist_type": game_type,
        "group_size": None,
        "gender": None,
        "label": None,
        "listener_tier": None,
        "album_count": None,
        "status": None,
    }


def map_genres(raw_genres):
    """Convert MusicBrainz genres into our fixed genre list (max 3)."""
    found = []
    ranked = sorted(raw_genres, key=lambda g: g.get("count", 0), reverse=True)

    for item in ranked:
        name = item["name"].casefold()
        for keyword, genre in GENRE_KEYWORDS:
            if keyword in name:
                if genre not in found:
                    found.append(genre)
                break
        if len(found) == 3:
            break

    return found


def enrich_artist(artist):
    """Fill gameplay fields using extra MusicBrainz lookups."""
    mbid = artist["musicbrainz_id"]
    details = mb_get(f"artist/{mbid}", inc="genres+artist-rels")

    artist["genres"] = map_genres(details.get("genres", []))

    # Gender: only solo artists have it in MusicBrainz.
    gender = (details.get("gender") or "").casefold()
    if artist["artist_type"] == "solo" and gender in ("male", "female"):
        artist["gender"] = gender

    # Group size = current members; exactly 2 means duo.
    if artist["artist_type"] == "group":
        members = [
            r for r in details.get("relations", [])
            if r.get("type") == "member of band"
            and r.get("direction") == "backward"
            and not r.get("ended")
        ]
        if members:
            artist["group_size"] = len(members)
            if len(members) == 2:
                artist["artist_type"] = "duo"

    # Discography: all albums, EPs, and singles (paginated).
    groups, offset = [], 0
    while True:
        page = mb_get(
            "release-group", artist=mbid,
            type="album|ep|single", limit=100, offset=offset,
        )
        batch = page.get("release-groups", [])
        groups.extend(batch)
        offset += len(batch)
        if not batch or offset >= page.get("release-group-count", 0):
            break

    years = [
        int(g["first-release-date"][:4]) for g in groups
        if g.get("first-release-date")
        and g["first-release-date"][:4].isdigit()
    ]
    if years:
        artist["debut_year"] = min(years)

    # Studio album = primary type Album with no secondary types.
    studio = [
        g for g in groups
        if g.get("primary-type") == "Album" and not g.get("secondary-types")
    ]
    artist["album_count"] = len(studio)

    # Status
    ended = details.get("life-span", {}).get("ended")
    if ended:
        is_band = artist["artist_type"] in ("group", "duo")
        artist["status"] = "disbanded" if is_band else "inactive"
    elif years:
        recent = max(years) >= datetime.date.today().year - 3
        artist["status"] = "active" if recent else "inactive"


def has_value(value):
    return value is not None and value != "" and value != []


def merge_artist(fetched, previous):
    """
    Update an artist with fetched metadata while preserving
    existing non-empty values, including manually curated fields.
    """
    merged = fetched.copy()

    for key, value in previous.items():
        if has_value(value):
            merged[key] = value

    # Keep the canonical identity returned by MusicBrainz.
    merged["musicbrainz_id"] = fetched["musicbrainz_id"]
    merged["id"] = f"mb_{fetched['musicbrainz_id']}"

    return merged


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Load all existing artists first.
    if OUTPUT_FILE.exists():
        try:
            old_data = json.loads(
                OUTPUT_FILE.read_text(encoding="utf-8")
            )
        except (json.JSONDecodeError, OSError) as error:
            print(f"Cannot read existing JSON: {error}")
            print("No changes were saved.")
            return

        if not isinstance(old_data, list):
            print("ERROR: artists.json must contain a JSON array.")
            print("No changes were saved.")
            return

        if not all(isinstance(item, dict) for item in old_data):
            print("ERROR: Every artist record must be an object.")
            print("No changes were saved.")
            return

        results = old_data.copy()
    else:
        results = []

    # Map existing MusicBrainz IDs to their positions.
    positions = {}

    for index, artist in enumerate(results):
        mbid = artist.get("musicbrainz_id")

        if mbid:
            if mbid in positions:
                print(f"WARNING: Duplicate existing MusicBrainz ID: {mbid}")
            else:
                positions[mbid] = index

    added = 0
    updated = 0
    failed = 0

    for name in SEED_ARTISTS:
        try:
            fetched = search_artist(name)

            if fetched:
                mbid = fetched["musicbrainz_id"]

                # Skip the slow enrichment step for artists already done.
                already_done = (
                    mbid in positions
                    and results[positions[mbid]].get("album_count") is not None
                )

                if not already_done:
                    try:
                        enrich_artist(fetched)
                    except Exception as error:
                        print(f"ENRICH FAILED: {name}: {error}")

                if mbid in positions:
                    position = positions[mbid]

                    results[position] = merge_artist(
                        fetched,
                        results[position],
                    )

                    updated += 1
                    print(f"UPDATED: {fetched['name']}")

                else:
                    positions[mbid] = len(results)
                    results.append(fetched)

                    added += 1
                    print(f"ADDED: {fetched['name']}")

        except Exception as error:
            failed += 1
            print(f"ERROR: {name}: {error}")

    # Save all existing records plus successfully fetched artists.
    temporary_file = OUTPUT_FILE.with_suffix(".tmp")

    try:
        temporary_file.write_text(
            json.dumps(results, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        temporary_file.replace(OUTPUT_FILE)

    except OSError as error:
        print(f"ERROR saving artists.json: {error}")
        print("Check the file permissions and try again.")
        return

    print("\n========== FETCH SUMMARY ==========")
    print(f"New artists added: {added}")
    print(f"Existing artists updated: {updated}")
    print(f"Lookup failures: {failed}")
    print(f"Total artist records: {len(results)}")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()