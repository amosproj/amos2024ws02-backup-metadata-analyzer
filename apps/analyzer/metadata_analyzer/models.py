from datetime import datetime
from typing import ClassVar, Optional

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import mapped_column, Mapped


class Base(DeclarativeBase):
    pass


class Result(Base):
    __tablename__ = "results"

    # For now I only added the most relevant columns
    saveset: Mapped[str] = mapped_column(primary_key=True)
    uuid: Mapped[str]
    task: Mapped[str]
    task_uuid: Mapped[str]
    fdi_type: Mapped[str]
    is_backup: Mapped[int]
    state: Mapped[int]
    subtask_flag: Mapped[str]
    schedule: Mapped[str]

    start_time: Mapped[datetime]
    stop_time: Mapped[datetime]
    sbc_start: Mapped[datetime]

    data_size: Mapped[int]
    stored_size: Mapped[int]
    total_size: Mapped[int]
    throughput: Mapped[str]
    duration: Mapped[int]
    scheduledTime: ClassVar[Optional[datetime]] = None

    def __repr__(self):
        return f"""Result(uuid={self.uuid})"""

    def __str__(self):
        return repr(self)

    # TODO clean up model attributes
    def as_dict(self):
        return {
            "saveset": self.saveset,
            "uuid": self.uuid,
            "task": self.task,
            "task_uuid": self.task_uuid,
            "fdi_type": self.fdi_type,
            "is_backup": self.is_backup,
            "state": self.state,
            "start_time": self.start_time,
            "stop_time": self.stop_time,
            "sbc_start": self.sbc_start,
            "data_size": self.data_size,
            "throughput": self.throughput,
            "duration": self.duration,
            "scheduledTime": self.scheduledTime,
            "stored_size": self.stored_size,
            "total_size": self.data_size,
            "subtask_flag": self.subtask_flag,
        }


class Tasks(Base):
    __tablename__ = "tasks"

    # For now I only added the most relevant columns
    task: Mapped[str] = mapped_column(primary_key=True)
    uuid: Mapped[str]

    def __repr__(self):
        return f"""Tasks(uuid={self.uuid})"""

    def __str__(self):
        return repr(self)


class DataStore(Base):
    __tablename__ = "data_stores"

    # For now I only added the most relevant columns
    name: Mapped[str] = mapped_column(primary_key=True)
    uuid: Mapped[str]
    capacity: Mapped[float]
    high_water_mark: Mapped[float]
    filled: Mapped[float]
    stored: Mapped[float]

    def __repr__(self):
        return f"""DataStore(name={self.name})"""

    def __str__(self):
        return repr(self)


class Schedule(Base):
    __tablename__ = "schedules"

    # For now I only added the most relevant columns
    name: Mapped[str] = mapped_column(primary_key=True)
    uuid: Mapped[str]

    p_base: Mapped[str]
    p_count: Mapped[int]

    start_time: Mapped[str]

    mo: Mapped[str]
    tu: Mapped[str]
    we: Mapped[str]
    th: Mapped[str]
    fr: Mapped[str]
    sa: Mapped[str]
    su: Mapped[str]

    def __repr__(self):
        return f"""Schedule(name={self.name})"""

    def __str__(self):
        return repr(self)


class TaskEvent(Base):
    __tablename__ = "task_events"

    # For now I only added the most relevant columns
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    object: Mapped[str]
    schedule: Mapped[str]

    def __repr__(self):
        return f"""TaskEvent(id={self.id})"""

    def __str__(self):
        return repr(self)


class ResultLabel(Base):
    __tablename__ = "result_lbls"

    saveset: Mapped[str] = mapped_column(primary_key=True)
    uuid: Mapped[str]
    pool: Mapped[str]
    backup_id: Mapped[str]
    id: Mapped[str]

    def __repr__(self):
        return f"""ResultLabel(saveset={self.saveset})"""

    def __str__(self):
        return repr(self)

    def as_dict(self):
        return {
            "saveset": self.saveset,
            "uuid": self.uuid,
            "pool": self.pool,
            "backup_id": self.backup_id,
            "id": self.id,
        }
