import threading
import time
from datetime import datetime, timedelta, time as time_cls
from flask import current_app

from .email_service import send_daily_booking_summary
from .settings_service import get_settings


def _seconds_until_next_run(app):
    now = datetime.now()
    settings = get_settings()

    if not settings.daily_summary_enabled:
        # not enabled right now — recheck in a day in case it gets turned back on
        return 86400, now + timedelta(days=1)

    target_time = time_cls(settings.daily_summary_hour, 0)
    target = datetime.combine(now.date(), target_time)

    if now >= target:
        target += timedelta(days=1)

    return (target - now).total_seconds(), target


def _scheduler_loop(app):
    with app.app_context():
        while True:
            seconds, target = _seconds_until_next_run(app)
            current_app.logger.info(
                f"Daily booking summary scheduler: next run at {target.isoformat()} ({int(seconds)} seconds from now)"
            )
            time.sleep(seconds)

            if not get_settings().daily_summary_enabled:
                current_app.logger.info("Daily booking summary is disabled — skipping this run")
                time.sleep(60)
                continue

            try:
                current_app.logger.info("Running daily booking summary task...")
                send_daily_booking_summary()
                current_app.logger.info("Daily booking summary task completed")
            except Exception as exc:
                current_app.logger.error(f"Daily booking summary task failed: {exc}")

            # small buffer so the loop recalculates the next run time cleanly
            time.sleep(60)


def start_daily_summary_scheduler(app):
    thread = threading.Thread(target=_scheduler_loop, args=(app,), daemon=True)
    thread.start()
