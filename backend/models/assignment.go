package models

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	ID          uint           `gorm:"primaryKey;type:bigint unsigned" json:"id"`
	GuruID      uint           `gorm:"not null;type:bigint unsigned" json:"guru_id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	DueDate     *time.Time     `json:"due_date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Guru        User           `gorm:"foreignKey:GuruID" json:"guru,omitempty"`
}

type AssignmentSubmission struct {
	ID           uint           `gorm:"primaryKey;type:bigint unsigned" json:"id"`
	AssignmentID uint           `gorm:"not null;type:bigint unsigned" json:"assignment_id"`
	MahasiswaID  uint           `gorm:"not null;type:bigint unsigned" json:"mahasiswa_id"`
	Status       string         `gorm:"type:enum('pending','submitted','graded');default:'pending'" json:"status"`
	SubmittedAt  *time.Time     `json:"submitted_at"`
	Grade        *float64       `json:"grade"`
	Feedback     string         `gorm:"type:text" json:"feedback"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	Assignment   Assignment     `gorm:"foreignKey:AssignmentID" json:"assignment,omitempty"`
	Mahasiswa    User           `gorm:"foreignKey:MahasiswaID" json:"mahasiswa,omitempty"`
}

// TableName overrides the default table name
func (Assignment) TableName() string {
	return "assignments"
}

// TableName overrides the default table name
func (AssignmentSubmission) TableName() string {
	return "assignment_submissions"
}
