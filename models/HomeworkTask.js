export default class HomeworkTask {
  constructor(
    id,
    title,
    courseName,
    dueDate,
    dueTime,
    priority,
    notes = '',
    attachments = [],
    isCompleted = false,
    type = 'homework',
    groupId = null,
    subTasks = []
  ) {
    this.id = id;
    this.title = title;
    this.courseName = courseName;
    this.dueDate = dueDate; // ISO string format "YYYY-MM-DD"
    this.dueTime = dueTime; // 24-hour format "HH:MM"
    this.priority = priority; // "high", "medium", "low"
    this.notes = notes;
    this.attachments = attachments; // Array of file URIs
    this.isCompleted = isCompleted;
    this.createdAt = new Date().toISOString();
    this.type = type; // Type of assignment (homework, exam, etc.)
    this.groupId = groupId; // Custom group identifier
    this.subTasks = subTasks; // Array of sub-tasks
  }

  // Helper method to check if the task is due today
  isDueToday() {
    const today = new Date().toISOString().split('T')[0];
    return today === this.dueDate;
  }

  // Helper method to check if the task is overdue
  isOverdue() {
    const today = new Date();
    const dueDateTime = new Date(`${this.dueDate}T${this.dueTime}`);
    return today > dueDateTime && !this.isCompleted;
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
  getFormattedDueDate() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
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
} 