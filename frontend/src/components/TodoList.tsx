import React, { useState, useEffect } from 'react';
import { CheckIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  compact?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({ compact = false }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('focus-ritual-todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem('focus-ritual-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      const newTodo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className={`w-full ${compact ? 'scale-90 origin-top' : ''}`}>
      <form onSubmit={addTodo} className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a task..."
          className="flex-grow px-3 py-2 rounded-l-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button 
          type="submit"
          className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-r-lg text-white"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </form>
      
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {todos.length === 0 ? (
          <p className="text-slate-400 text-center py-2">No tasks yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                todo.completed ? 'bg-slate-700/50' : 'bg-slate-700'
              }`}
            >
              <div 
                className="flex items-center cursor-pointer flex-1"
                onClick={() => toggleTodo(todo.id)}
              >
                <div className={`h-5 w-5 rounded flex items-center justify-center mr-3 border ${
                  todo.completed ? 'bg-green-600 border-green-600' : 'border-slate-400'
                }`}>
                  {todo.completed && <CheckIcon className="h-4 w-4 text-white" />}
                </div>
                <span className={`${todo.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="ml-2 text-slate-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList; 