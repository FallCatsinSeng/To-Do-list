package models

import (
	"time"

	"gorm.io/gorm"
)

type Todo struct {
	ID        uint           `gorm:"primaryKey;type:bigint unsigned" json:"id"`
	UserID    uint           `gorm:"type:bigint unsigned;not null;index" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Title     string         `gorm:"size:255;not null" json:"title"`
	Status    string         `gorm:"type:enum('pending','done');default:'pending'" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Todo) TableName() string {
	return "todo"
}
