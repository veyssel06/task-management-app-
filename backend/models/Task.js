const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String, default: '' },
  priority:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status:        { type: String, enum: ['todo', 'inProgress', 'done', 'archived'], default: 'todo' },
  dueDate:       { type: Date, default: null },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:     { type: Date, default: Date.now },
  completedAt:   { type: Date, default: null },
  archivedAt:    { type: Date, default: null },
  archiveReason: { type: String, default: null },  // ← yeni alan
})

module.exports = mongoose.model('Task', taskSchema)