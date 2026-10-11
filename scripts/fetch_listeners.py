import json
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "public" / "data" / "artists.json"
API_KEY = os.environ.get("LASTFM_API_KEY")

# MusicBrainz name -> Last.fm name, for artists whose names differ.
LASTFM_NAMES = {
    "Ye": "Kanye West",
}


def lastfm_call(**extra):
    params = urllib.parse.urlencode({
        "method": "artist.getinfo",
        "api_key": API_KEY,
        "format": "json",
        **extra,
    })
    request = urllib.request.Request(
        "https://ws.audioscrobbler.com/2.0/?" + params,
        headers={"User-Agent": "artistguessr/0.1"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def get_listeners(artist):
    # Try the MusicBrainz ID first, then fall back to the name.
    data = lastfm_call(mbid=artist["musicbrainz_id"])

    if "artist" not in data:
        name = LASTFM_NAMES.get(artist["name"], artist["name"])
        data = lastfm_call(artist=name, autocorrect=1)

    if "artist" not in data:
        raise ValueError(data.get("message", "not found"))

    return int(data["artist"]["stats"]["listeners"])


def main():
    if not API_KEY:
        print("Set the LASTFM_API_KEY environment variable first.")
        return

    artists = json.loads(FILE.read_text(encoding="utf-8"))

    # 1. Get listener counts (artists that already have one are skipped).
    for artist in artists:
        if artist.get("listener_count"):
            continue
        try:
            artist["listener_count"] = get_listeners(artist)
            print(f"OK: {artist['name']} = {artist['listener_count']:,}")
        except Exception as error:
            print(f"FAILED: {artist['name']}: {error}")
        time.sleep(0.3)

    # 2. Rank everyone and split into quarters.
    counted = [a for a in artists if a.get("listener_count")]
    counted.sort(key=lambda a: a["listener_count"], reverse=True)
    total = len(counted)

    for rank, artist in enumerate(counted):
        if artist.get("listener_tier") is not None:
            continue  # keep anything you set by hand
        share = rank / total
        if share < 0.25:
            artist["listener_tier"] = "very_high"
        elif share < 0.50:
            artist["listener_tier"] = "high"
        elif share < 0.75:
            artist["listener_tier"] = "medium"
        else:
            artist["listener_tier"] = "low"

    FILE.write_text(
        json.dumps(artists, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nDone. Tiers set for {total} artists.")


if __name__ == "__main__":
    main()