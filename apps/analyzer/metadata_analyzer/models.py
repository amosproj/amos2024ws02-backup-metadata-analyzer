from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Result(Base):
    __tablename__ = "results"

    # For now I only added the most relevant columns
    saveset: Mapped[str] = mapped_column(primary_key=True)
    uuid: Mapped[str]
    task: Mapped[str]
    fdi_type: Mapped[str]
    is_backup: Mapped[int]
    state: Mapped[int]

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
