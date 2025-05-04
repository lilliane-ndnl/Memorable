class Course {
  constructor(id, name, color, schedule = []) {
    this.id = id;
    this.name = name;
    this.color = color; 
    this.schedule = schedule; // Array of schedule objects with day, startTime, endTime, location
  }

  addClassTime(day, startTime, endTime, location = '') {
    this.schedule.push({
      day,
      startTime,
      endTime,
      location,
      id: Date.now().toString()
    });
  }

  removeClassTime(scheduleId) {
    this.schedule = this.schedule.filter((item) => item.id !== scheduleId);
  }

  updateClassTime(scheduleId, updatedData) {
    this.schedule = this.schedule.map((item) => {
      if (item.id === scheduleId) {
        return { ...item, ...updatedData };
      }
      return item;
    });
  }

  getFormattedSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return this.schedule
      .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day))
      .map(session => {
        return `${session.day}: ${session.startTime} - ${session.endTime}${session.location ? ` at ${session.location}` : ''}`;
      })
      .join('\n');
  }
}

export default Course; 