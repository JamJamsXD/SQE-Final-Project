
import { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete SQE Final Project', completed: false },
    { id: 2, title: 'Review React fundamentals', completed: true },
    { id: 3, title: 'Prepare project documentation', completed: false }
  ]);

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('All');

  // Add a new task
  const addTask = (event) => {
    event.preventDefault();

    const title = newTask.trim();

    if (!title) return;

    const task = {
      id: Date.now(),
      title: title,
      completed: false
    };

    setTasks((previousTasks) => [...previousTasks, task]);
    setNewTask('');
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>TaskFlow</h1>
          <p>Organize your tasks. Get things done.</p>
        </div>
        <span className="logo">TF</span>
      </header>

      <main className="container">
        <section className="welcome">
          <h2>My Tasks</h2>
          <p>Keep track of everything you need to accomplish.</p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Tasks</span>
            <h2>{tasks.length}</h2>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <h2>{completedCount}</h2>
          </div>

          <div className="stat-card">
            <span>Pending</span>
            <h2>{tasks.length - completedCount}</h2>
          </div>
        </section>

        <section className="task-section">
          <form className="task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
            />

            <button type="submit">Add Task</button>
          </form>

          <div className="filters">
            {['All', 'Pending', 'Completed'].map((option) => (
              <button
                key={option}
                className={filter === option ? 'active' : ''}
                onClick={() => setFilter(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <p className="empty">
                No tasks found. Add a new task to get started!
              </p>
            ) : (
              filteredTasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />

                    <span className={task.completed ? 'done' : ''}>
                      {task.title}
                    </span>
                  </label>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>TaskFlow © 2026 | Software Quality Engineering Project</p>
      </footer>
    </div>
  );
}

export default App;
