package models

import (
	"time"
)

type MahasiswaGuru struct {
	ID          uint           `gorm:"primaryKey;type:bigint unsigned" json:"id"`
	MahasiswaID uint           `gorm:"not null;type:bigint unsigned" json:"mahasiswa_id"`
	GuruID      uint           `gorm:"not null;type:bigint unsigned" json:"guru_id"`
	Status      string         `gorm:"type:enum('pending','approved','rejected');default:'pending'" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Mahasiswa   User           `gorm:"foreignKey:MahasiswaID" json:"mahasiswa,omitempty"`
	Guru        User           `gorm:"foreignKey:GuruID" json:"guru,omitempty"`
}

// TableName overrides the default table name
func (MahasiswaGuru) TableName() string {
	return "mahasiswa_guru"
}
