from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class BackupData(Base):
    __tablename__ = "BackupData"

    id: Mapped[str] = mapped_column(primary_key=True)
    sizeMB: Mapped[int]
    creationDate: Mapped[datetime]
    bio: Mapped[str]

    def __repr__(self):
        return f"""BackupData(id={self.id}, sizeMB={self.sizeMB}, creationDate={self.creationDate}, bio={self.bio!r})"""

    def __str__(self):
        return repr(self)
