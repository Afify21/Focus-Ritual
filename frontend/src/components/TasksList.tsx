import React, { useState } from 'react';

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

const TasksList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
            setNewTask('');
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Tasks</h3>
            <div className="space-y-2 mb-3">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-4 w-4 rounded border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-800"
                        />
                        <span className={`text-sm flex-1 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                            {task.text}
                        </span>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a task..."
                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
                <button
                    onClick={addTask}
                    className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 px-3 py-1.5 rounded text-sm transition-colors"
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default TasksList; 