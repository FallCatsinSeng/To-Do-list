package models

import (
	"time"

	"gorm.io/gorm"
)

type Siswa struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Nama      string         `gorm:"size:100" json:"nama"`
	NIM       string         `gorm:"size:50;index" json:"nim"`
	Jurusan   string         `gorm:"size:50" json:"jurusan"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Siswa) TableName() string {
	return "siswa"
}
