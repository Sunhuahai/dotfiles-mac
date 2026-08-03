#!/usr/bin/env python3
"""Validate deterministic chronology constraints in a NovelStudio timeline."""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path


REQUIRED_FIELDS = {"id", "start", "end", "location", "characters", "depends_on"}


def parse_time(value: object, event_id: str, field: str, errors: list[str]) -> datetime | None:
    if not isinstance(value, str):
        errors.append(f"{event_id}: {field} 必须是带时区的 ISO 8601 字符串")
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        errors.append(f"{event_id}: {field} 不是有效的 ISO 8601 时间：{value}")
        return None
    if parsed.tzinfo is None:
        errors.append(f"{event_id}: {field} 缺少时区：{value}")
        return None
    return parsed


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return [f"无法读取时间线：{exc}"]

    if not isinstance(data, list):
        return ["时间线根节点必须是事件数组"]

    records: dict[str, dict[str, object]] = {}
    times: dict[str, tuple[datetime, datetime]] = {}

    for index, event in enumerate(data, start=1):
        if not isinstance(event, dict):
            errors.append(f"第 {index} 项不是对象")
            continue
        event_id = event.get("id")
        if not isinstance(event_id, str) or not event_id.strip():
            errors.append(f"第 {index} 项缺少有效 id")
            continue
        missing = REQUIRED_FIELDS - event.keys()
        if missing:
            errors.append(f"{event_id}: 缺少字段 {', '.join(sorted(missing))}")
        if event_id in records:
            errors.append(f"{event_id}: id 重复")
            continue
        records[event_id] = event
        start = parse_time(event.get("start"), event_id, "start", errors)
        end = parse_time(event.get("end"), event_id, "end", errors)
        if start and end:
            if end < start:
                errors.append(f"{event_id}: end 早于 start")
            times[event_id] = (start, end)
        if not isinstance(event.get("characters"), list) or not all(
            isinstance(item, str) and item for item in event.get("characters", [])
        ):
            errors.append(f"{event_id}: characters 必须是非空字符串数组")
        if not isinstance(event.get("depends_on"), list) or not all(
            isinstance(item, str) and item for item in event.get("depends_on", [])
        ):
            errors.append(f"{event_id}: depends_on 必须是字符串数组")

    for event_id, event in records.items():
        dependencies = event.get("depends_on", [])
        if not isinstance(dependencies, list):
            continue
        for dependency in dependencies:
            if dependency not in records:
                errors.append(f"{event_id}: 依赖不存在的事件 {dependency}")
                continue
            if event_id in times and dependency in times and times[dependency][1] > times[event_id][0]:
                errors.append(f"{event_id}: 开始时间早于依赖事件 {dependency} 的结束时间")

    appearances: dict[str, list[tuple[datetime, datetime, str, str]]] = defaultdict(list)
    for event_id, event in records.items():
        if event_id not in times or not isinstance(event.get("characters"), list):
            continue
        start, end = times[event_id]
        location = str(event.get("location", ""))
        for character in event["characters"]:
            if isinstance(character, str):
                appearances[character].append((start, end, event_id, location))

    for character, events in appearances.items():
        events.sort(key=lambda item: item[0])
        for previous, current in zip(events, events[1:]):
            if current[0] < previous[1]:
                errors.append(
                    f"{character}: 事件 {previous[2]}（{previous[3]}）与 {current[2]}（{current[3]}）时间重叠"
                )

    return errors


def main() -> int:
    if len(sys.argv) != 2:
        print("用法：validate_timeline.py <timeline.json>")
        return 2
    errors = validate(Path(sys.argv[1]).expanduser().resolve())
    if errors:
        print("TIMELINE_INVALID")
        for error in errors:
            print(f"- {error}")
        return 1
    print("TIMELINE_VALID")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
