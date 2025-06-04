import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CalendarIcon, ExclamationCircleIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/solid';
import DataService, { Task } from '../services/DataService';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

type SortOption = 'priority' | 'dueDate' | 'createdAt';
type FilterOption = 'all' | 'completed' | 'active' | 'highPriority';

const EnhancedTodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Load tasks from localStorage
    const loadTasks = () => {
      const tasks = DataService.Tasks.getTasks();
      setTasks(tasks);
    };

    loadTasks();

    // Listen for storage events
    const handleStorageChange = () => {
      loadTasks();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addTask = () => {
    if (newTaskTitle.trim() === '') return;

    if (editingTask) {
      // Update existing task
      const updatedTask: Task = {
        ...editingTask,
        title: newTaskTitle,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined
      };

      DataService.Tasks.updateTask(updatedTask);
      setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
      setEditingTask(null);
    } else {
      // Add new task
      const newTask = DataService.Tasks.addTask({
        title: newTaskTitle,
        completed: false,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || undefined
      });

      setTasks([...tasks, newTask]);
    }

    // Reset form
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    
    // Focus back on input
    if (newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  };

  const deleteTask = (id: string) => {
    DataService.Tasks.deleteTask(id);
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTask = DataService.Tasks.toggleTaskCompletion(id);
    if (updatedTask) {
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskPriority(task.priority);
    setNewTaskDueDate(task.dueDate || '');
    
    // Focus on input
    if (newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    // First apply filters
    let filteredTasks = [...tasks];
    
    if (filterBy === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filterBy === 'active') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filterBy === 'highPriority') {
      filteredTasks = filteredTasks.filter(task => task.priority === 'high');
    }
    
    // Then sort
    return filteredTasks.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityValue = { 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityValue[b.priority] || 0) - (priorityValue[a.priority] || 0);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        // createdAt
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const getCompletedCount = () => {
    return tasks.filter(task => task.completed).length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formattedDueDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d');
    } catch (e) {
      return dateString;
    }
  };

  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 2;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    
    return due < today;
  };

  return (
    <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-sm p-4 rounded-xl shadow-xl`}>
      <h2 className="text-lg font-bold mb-4">Task List</h2>
      
      {/* Input form for new/edit task */}
      <div className="mb-4 space-y-3">
        <div className="flex">
          <input
            ref={newTaskInputRef}
            type="text"
            placeholder={editingTask ? "Edit task" : "Add a new task"}
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className={`flex-1 px-3 py-2 bg-slate-700 rounded-l text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            onKeyDown={e => {
              if (e.key === 'Enter') addTask();
              if (e.key === 'Escape' && editingTask) cancelEdit();
            }}
            aria-label={editingTask ? "Edit task title" : "New task title"}
          />
          <button
            onClick={addTask}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-r text-white"
            aria-label={editingTask ? "Save task" : "Add task"}
          >
            {editingTask ? 'Save' : 'Add'}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Priority</label>
            <div className="flex space-x-1">
              <button
                onClick={() => setNewTaskPriority('low')}
                className={`flex-1 py-1 text-xs rounded ${
                  newTaskPriority === 'low' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}
                aria-pressed={newTaskPriority === 'low'}
              >
                Low
              </button>
              <button
                onClick={() => setNewTaskPriority('medium')}
                className={`flex-1 py-1 text-xs rounded ${
                  newTaskPriority === 'medium' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}
                aria-pressed={newTaskPriority === 'medium'}
              >
                Medium
              </button>
              <button
                onClick={() => setNewTaskPriority('high')}
                className={`flex-1 py-1 text-xs rounded ${
                  newTaskPriority === 'high' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}
                aria-pressed={newTaskPriority === 'high'}
              >
                High
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Due Date (Optional)</label>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={e => setNewTaskDueDate(e.target.value)}
              className="w-full px-3 py-1 bg-slate-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Task due date"
            />
          </div>
        </div>
        
        {editingTask && (
          <div className="flex justify-end">
            <button
              onClick={cancelEdit}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white text-xs"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* Task filter and sort controls */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-slate-400">
          {getCompletedCount()} of {tasks.length} completed
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowSortOptions(!showSortOptions);
                setShowFilterOptions(false);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              aria-expanded={showSortOptions}
              aria-controls="sort-options"
            >
              <ArrowsUpDownIcon className="h-3 w-3" />
              <span>Sort</span>
            </button>
            
            {showSortOptions && (
              <div 
                id="sort-options"
                className="absolute right-0 mt-1 w-40 bg-slate-800 rounded shadow-lg z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSortBy('priority');
                      setShowSortOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      sortBy === 'priority' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={sortBy === 'priority'}
                  >
                    Priority
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('dueDate');
                      setShowSortOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      sortBy === 'dueDate' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={sortBy === 'dueDate'}
                  >
                    Due Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('createdAt');
                      setShowSortOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      sortBy === 'createdAt' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={sortBy === 'createdAt'}
                  >
                    Recently Added
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterOptions(!showFilterOptions);
                setShowSortOptions(false);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600"
              aria-expanded={showFilterOptions}
              aria-controls="filter-options"
            >
              <FunnelIcon className="h-3 w-3" />
              <span>Filter</span>
            </button>
            
            {showFilterOptions && (
              <div 
                id="filter-options"
                className="absolute right-0 mt-1 w-40 bg-slate-800 rounded shadow-lg z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilterBy('all');
                      setShowFilterOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      filterBy === 'all' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={filterBy === 'all'}
                  >
                    All Tasks
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('active');
                      setShowFilterOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      filterBy === 'active' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={filterBy === 'active'}
                  >
                    Active Only
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('completed');
                      setShowFilterOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      filterBy === 'completed' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={filterBy === 'completed'}
                  >
                    Completed Only
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('highPriority');
                      setShowFilterOptions(false);
                    }}
                    className={`block px-4 py-2 text-left text-xs w-full hover:bg-slate-700 ${
                      filterBy === 'highPriority' ? 'bg-slate-700' : ''
                    }`}
                    aria-current={filterBy === 'highPriority'}
                  >
                    High Priority
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Task list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {getFilteredAndSortedTasks().length === 0 ? (
          <div className="text-center py-6 text-slate-400 italic">
            {tasks.length === 0
              ? "No tasks yet. Add one to get started!"
              : "No tasks match your current filter."}
          </div>
        ) : (
          getFilteredAndSortedTasks().map(task => (
            <div 
              key={task.id} 
              className={`p-3 rounded-lg ${
                task.completed 
                  ? `${currentTheme.colors.assistantMessageBg} border-l-4 border-green-500` 
                  : currentTheme.colors.userMessageBg
              }`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="mr-3 mt-1 h-4 w-4 rounded border-slate-600 cursor-pointer"
                  aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span 
                      className={`mr-2 h-2 w-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}
                      aria-hidden="true"
                    ></span>
                    <span className={`font-medium ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  
                  {task.dueDate && (
                    <div className={`flex items-center mt-1 text-xs ${
                      isOverdue(task.dueDate) 
                        ? 'text-red-400' 
                        : isDueSoon(task.dueDate) 
                          ? 'text-yellow-400' 
                          : 'text-slate-400'
                    }`}>
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {isOverdue(task.dueDate) 
                          ? `Overdue: ${formattedDueDate(task.dueDate)}` 
                          : isDueSoon(task.dueDate) 
                            ? `Due soon: ${formattedDueDate(task.dueDate)}` 
                            : `Due: ${formattedDueDate(task.dueDate)}`}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => editTask(task)}
                    className="text-slate-400 hover:text-blue-400 p-1"
                    aria-label={`Edit task "${task.title}"`}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-400 hover:text-red-400 p-1"
                    aria-label={`Delete task "${task.title}"`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedTodoList; 