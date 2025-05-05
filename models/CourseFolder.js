export default class CourseFolder {
  constructor({
    id,
    name,
    courseId,
    parentId = null,
    type = 'folder', // 'folder' or 'file' or 'bookmark'
    content = null, // For files: file data, For bookmarks: {url, title, description}
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    children = [], // Array of sub-folders/files/bookmarks
  }) {
    this.id = id;
    this.name = name;
    this.courseId = courseId;
    this.parentId = parentId;
    this.type = type;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.children = children;
  }

  // Add a child item (folder, file, or bookmark)
  addChild(child) {
    this.children.push(child);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Remove a child item
  removeChild(childId) {
    this.children = this.children.filter(child => child.id !== childId);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Update folder name
  updateName(newName) {
    this.name = newName;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Add a file
  addFile(fileData) {
    const file = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: fileData.name,
      type: 'file',
      content: fileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.addChild(file);
  }

  // Add a bookmark
  addBookmark(bookmarkData) {
    const bookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: bookmarkData.title,
      type: 'bookmark',
      content: bookmarkData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.addChild(bookmark);
  }

  // Create a sub-folder
  createSubFolder(folderName) {
    const subFolder = new CourseFolder({
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: folderName,
      courseId: this.courseId,
      parentId: this.id,
    });
    return this.addChild(subFolder);
  }

  // Get all items of a specific type
  getItemsByType(type) {
    return this.children.filter(item => item.type === type);
  }

  // Find an item by ID (including nested items)
  findItemById(itemId) {
    if (this.id === itemId) return this;
    
    for (const child of this.children) {
      if (child.id === itemId) return child;
      if (child.type === 'folder') {
        const found = child.findItemById(itemId);
        if (found) return found;
      }
    }
    
    return null;
  }

  // Get the full path of the folder
  getPath() {
    const path = [this.name];
    let current = this;
    
    while (current.parentId) {
      // Note: This assumes you have access to the parent folder
      // You might need to modify this based on your implementation
      current = current.parent;
      if (current) {
        path.unshift(current.name);
      }
    }
    
    return path.join('/');
  }

  // Convert to a flat structure for storage
  toFlatStructure() {
    const flat = [{
      id: this.id,
      name: this.name,
      courseId: this.courseId,
      parentId: this.parentId,
      type: this.type,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }];

    for (const child of this.children) {
      if (child.type === 'folder') {
        flat.push(...child.toFlatStructure());
      } else {
        flat.push({
          id: child.id,
          name: child.name,
          courseId: this.courseId,
          parentId: this.id,
          type: child.type,
          content: child.content,
          createdAt: child.createdAt,
          updatedAt: child.updatedAt,
        });
      }
    }

    return flat;
  }

  // Create from flat structure
  static fromFlatStructure(items) {
    const itemMap = new Map();
    const rootItems = [];

    // First pass: Create all items
    items.forEach(item => {
      const newItem = new CourseFolder(item);
      itemMap.set(item.id, newItem);
    });

    // Second pass: Build hierarchy
    items.forEach(item => {
      const currentItem = itemMap.get(item.id);
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.addChild(currentItem);
        }
      } else {
        rootItems.push(currentItem);
      }
    });

    return rootItems;
  }
} 