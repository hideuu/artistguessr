
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "public" / "data" / "artists.json"

REQUIRED_FIELDS = {
    "id", "musicbrainz_id", "name", "aliases", "country",
    "genres", "debut_year", "artist_type", "group_size",
    "gender", "label", "listener_tier", "album_count", "status",
}

VALID_TYPES = {"solo", "group", "duo"}
VALID_GENDERS = {"male", "female", "mixed", "unknown"}
VALID_STATUSES = {"active", "disbanded", "inactive"}
VALID_TIERS = {"low", "medium", "high", "very_high"}


def main():
    try:
        artists = json.loads(FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"Cannot read artist JSON: {error}")
        return

    if not isinstance(artists, list):
        print("ERROR: The JSON root must be an array.")
        return

    errors = []
    seen_ids = set()
    seen_mbids = set()

    for index, artist in enumerate(artists):
        if not isinstance(artist, dict):
            errors.append(f"Record {index}: must be an object")
            continue

        missing = REQUIRED_FIELDS - artist.keys()
        if missing:
            errors.append(
                f"Record {index}: missing fields {sorted(missing)}"
            )
            continue

        artist_id = artist["id"]
        mbid = artist["musicbrainz_id"]
        name = artist["name"]

        if not isinstance(name, str) or not name.strip():
            errors.append(f"Record {index}: invalid name")

        if not isinstance(artist_id, str) or not artist_id:
            errors.append(f"Record {index}: invalid ID")
        elif artist_id in seen_ids:
            errors.append(f"Duplicate ID: {artist_id}")
        seen_ids.add(artist_id)

        if mbid is not None:
            if not isinstance(mbid, str) or not mbid:
                errors.append(f"{artist_id}: invalid MusicBrainz ID")
            elif mbid in seen_mbids:
                errors.append(f"Duplicate MusicBrainz ID: {mbid}")
            seen_mbids.add(mbid)

        if artist["artist_type"] not in VALID_TYPES | {None}:
            errors.append(f"{artist_id}: invalid artist_type")

        if artist["gender"] not in VALID_GENDERS | {None}:
            errors.append(f"{artist_id}: invalid gender")

        if artist["status"] not in VALID_STATUSES | {None}:
            errors.append(f"{artist_id}: invalid status")

        if artist["listener_tier"] not in VALID_TIERS | {None}:
            errors.append(f"{artist_id}: invalid listener_tier")

        for field in ("aliases", "genres"):
            if not isinstance(artist[field], list):
                errors.append(f"{artist_id}: {field} must be a list")

        for field in ("debut_year", "group_size", "album_count"):
            value = artist[field]
            if value is not None and (
                not isinstance(value, int) or isinstance(value, bool)
            ):
                errors.append(f"{artist_id}: {field} must be an integer or null")

        if artist["debut_year"] is not None:
            if not 1800 <= artist["debut_year"] <= 2100:
                errors.append(f"{artist_id}: debut_year out of range")

        if artist["group_size"] is not None and artist["group_size"] < 1:
            errors.append(f"{artist_id}: group_size must be positive")

        if artist["album_count"] is not None and artist["album_count"] < 0:
            errors.append(f"{artist_id}: album_count cannot be negative")

    if errors:
        print(f"\nValidation failed: {len(errors)} issue(s)")
        for error in errors:
            print(f"- {error}")
    else:
        print(f"Validation passed: {len(artists)} artist records")

    # label is skipped for now (not used in the game yet).
    missing_by_artist = {}
    field_counts = {}

    for artist in artists:
        if not isinstance(artist, dict):
            continue

        missing = []
        for field in (
            "country", "genres", "debut_year", "artist_type",
            "gender", "listener_tier", "album_count", "status",
        ):
            value = artist.get(field)
            if value is None or value == []:
                missing.append(field)

        if artist.get("artist_type") in ("group", "duo") \
                and artist.get("group_size") is None:
            missing.append("group_size")

        if missing:
            missing_by_artist[artist.get("name", "Unknown")] = missing
            for field in missing:
                field_counts[field] = field_counts.get(field, 0) + 1

    if missing_by_artist:
        print(f"\nNeeds metadata review: {len(missing_by_artist)} artists")
        print("\nMissing fields, by count:")
        for field, count in sorted(
            field_counts.items(), key=lambda item: -item[1]
        ):
            print(f"- {field}: {count}")

        print("\nPer artist:")
        for name, missing in missing_by_artist.items():
            print(f"- {name}: {', '.join(missing)}")
    else:
        print("\nAll checked fields are filled (label not checked).")


if __name__ == "__main__":
    main()
