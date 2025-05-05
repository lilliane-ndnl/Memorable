export default class UnifiedTask {
  constructor({
    id,
    title,
    description = '',
    courseId = null, // Associated course ID (can be null for general tasks)
    courseName = null, // For display purposes
    dueDate = null, // ISO string format "YYYY-MM-DD"
    dueTime = null, // 24-hour format "HH:MM"
    priority = 'medium', // "high", "medium", "low"
    category = 'general', // "homework", "exam", "project", "reading", "general", etc.
    isCompleted = false,
    completedAt = null,
    reminderTime = null, // When to send a reminder
    reminderSent = false,
    subTasks = [], // Array of sub-task objects
    color = null, // Optional custom color
    attachments = [], // Array of file URIs or references
    tags = [], // Array of tag strings
    recurrence = null, // For repeating tasks
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.courseId = courseId;
    this.courseName = courseName;
    this.dueDate = dueDate;
    this.dueTime = dueTime;
    this.priority = priority;
    this.category = category;
    this.isCompleted = isCompleted;
    this.completedAt = completedAt;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.reminderTime = reminderTime;
    this.reminderSent = reminderSent;
    this.subTasks = subTasks;
    this.color = color;
    this.attachments = attachments;
    this.tags = tags;
    this.recurrence = recurrence;
  }

  // Update task properties
  update(newData) {
    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'id') {
        this[key] = newData[key];
      }
    });
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Mark task as complete
  markComplete() {
    this.isCompleted = true;
    this.completedAt = new Date().toISOString();
    return this;
  }

  // Mark task as incomplete
  markIncomplete() {
    this.isCompleted = false;
    this.completedAt = null;
    return this;
  }

  // Add a sub-task
  addSubTask(subTask) {
    this.subTasks.push({
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: subTask.title,
      completed: false,
      createdAt: new Date().toISOString()
    });
    return this;
  }

  // Update a sub-task
  updateSubTask(subTaskId, updates) {
    const index = this.subTasks.findIndex(st => st.id === subTaskId);
    if (index !== -1) {
      this.subTasks[index] = { ...this.subTasks[index], ...updates };
    }
    return this;
  }

  // Toggle sub-task completion
  toggleSubTaskCompletion(subTaskId) {
    const index = this.subTasks.findIndex(st => st.id === subTaskId);
    if (index !== -1) {
      this.subTasks[index].completed = !this.subTasks[index].completed;
    }
    return this;
  }

  // Remove a sub-task
  removeSubTask(subTaskId) {
    this.subTasks = this.subTasks.filter(st => st.id !== subTaskId);
    return this;
  }

  // Add an attachment
  addAttachment(attachment) {
    this.attachments.push(attachment);
    return this;
  }

  // Remove an attachment
  removeAttachment(attachmentId) {
    this.attachments = this.attachments.filter(a => a.id !== attachmentId);
    return this;
  }

  // Add a tag
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    return this;
  }

  // Remove a tag
  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this;
  }

  // Helper method to check if the task is due today
  isDueToday() {
    if (!this.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return today === this.dueDate;
  }

  // Helper method to check if the task is overdue
  isOverdue() {
    if (!this.dueDate) return false;
    const today = new Date();
    const dueDateTime = this.dueTime 
      ? new Date(`${this.dueDate}T${this.dueTime}`) 
      : new Date(`${this.dueDate}T23:59:59`);
    return today > dueDateTime && !this.isCompleted;
  }

  // Helper method to check if task is due soon (within next 48 hours)
  isDueSoon() {
    if (!this.dueDate) return false;
    
    const now = new Date();
    const soonCutoff = new Date(now);
    soonCutoff.setHours(now.getHours() + 48); // 48 hours from now
    
    const dueDateTime = this.dueTime 
      ? new Date(`${this.dueDate}T${this.dueTime}`) 
      : new Date(`${this.dueDate}T23:59:59`);
      
    return dueDateTime > now && dueDateTime <= soonCutoff;
  }

  // Helper method to get the priority color
  getPriorityColor() {
    switch (this.priority) {
      case 'high':
        return '#FF6B6B'; // Red
      case 'medium':
        return '#FFCC4D'; // Yellow
      case 'low':
        return '#63D471'; // Green
      default:
        return '#ADADAD'; // Gray
    }
  }

  // Create a formatted date string for display
  getFormattedDueDate(options = { weekday: 'short', month: 'short', day: 'numeric' }) {
    if (!this.dueDate) return 'No due date';
    return new Date(this.dueDate).toLocaleDateString(undefined, options);
  }
  
  // Helper method to check if all sub-tasks are completed
  areAllSubTasksCompleted() {
    if (!this.subTasks || this.subTasks.length === 0) {
      return true;
    }
    return this.subTasks.every(subTask => subTask.completed);
  }
  
  // Helper method to get completion percentage
  getCompletionPercentage() {
    if (!this.subTasks || this.subTasks.length === 0) {
      return this.isCompleted ? 100 : 0;
    }
    
    const completedCount = this.subTasks.filter(subTask => subTask.completed).length;
    return Math.round((completedCount / this.subTasks.length) * 100);
  }

  // Get category icon name (for Ionicons)
  getCategoryIconName() {
    switch (this.category.toLowerCase()) {
      case 'homework':
        return 'document-text';
      case 'exam':
        return 'school';
      case 'project':
        return 'construct';
      case 'reading':
        return 'book';
      case 'meeting':
        return 'people';
      case 'presentation':
        return 'easel';
      case 'assignment':
        return 'clipboard';
      case 'quiz':
        return 'help-circle';
      default:
        return 'checkbox';
    }
  }

  // Get task data for calendar events
  getCalendarEventData() {
    return {
      id: this.id,
      title: this.title,
      date: this.dueDate,
      time: this.dueTime,
      color: this.color || this.getPriorityColor(),
      type: 'task',
      courseName: this.courseName,
      category: this.category,
      isCompleted: this.isCompleted
    };
  }
} 