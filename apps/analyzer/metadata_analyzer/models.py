from datetime import datetime

from sqlalchemy.orm import mapped_column, Mapped, declarative_base

Base = declarative_base()


class BackupData(Base):
    __tablename__ = "BackupData"

    id: Mapped[str] = mapped_column(primary_key=True)
    saveset: Mapped[str]
    sizeMB: Mapped[int]
    creationDate: Mapped[datetime]
    bio: Mapped[str]

    def __repr__(self):
        return f"""BackupData(id={self.id}, sizeMB={self.sizeMB}, creationDate={self.creationDate}, bio={self.bio!r})"""

    def __str__(self):
        return repr(self)


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

    start_time: Mapped[datetime]
    stop_time: Mapped[datetime]
    sbc_start: Mapped[datetime]

    data_size: Mapped[int]
    throughput: Mapped[str]
    duration: Mapped[int]

    def __repr__(self):
        return f"""Result(uuid={self.uuid})"""

    def __str__(self):
        return repr(self)

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
