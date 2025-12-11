package models

import (
	"time"

	"gorm.io/gorm"
)

type Gallery struct {
	ID        uint           `gorm:"primaryKey;type:bigint unsigned" json:"id"`
	Filename  string         `gorm:"size:255;not null" json:"filename"`
	Uploader  uint           `gorm:"type:bigint unsigned;not null;index" json:"uploader"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Gallery) TableName() string {
	return "gallery"
}
