const mongoose = require("mongoose");

const Todo = require("../models/Todo");

const { createActivity, removeActivity } = require("../utils/activity");

/*
|--------------------------------------------------------------------------
| GET TODOS
|--------------------------------------------------------------------------
*/

const getTodos = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const todos = await Todo.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(todos);
  } catch (error) {
    console.error("GET TODOS ERROR:", error);

    return res.status(500).json({
      message: "Unable to get todos",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE TODO
|--------------------------------------------------------------------------
*/

const createTodo = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { title, category, priority } = req.body;

    const todoTitle = title;

    if (!todoTitle || !todoTitle.trim()) {
      return res.status(400).json({
        message: "Todo title is required",
      });
    }

    const todo = await Todo.create({
      user: userId,
      title: todoTitle.trim(),
      category: category || "Study",
      priority: priority || "Medium",
      completed: false,
    });

    return res.status(201).json(todo);
  } catch (error) {
    console.error("CREATE TODO ERROR:", error);

    return res.status(500).json({
      message: "Unable to create todo",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TODO
|--------------------------------------------------------------------------
*/

const updateTodo = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid todo ID",
      });
    }

    const todo = await Todo.findOne({
      _id: id,
      user: userId,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    const wasCompleted = todo.completed;

    /*
    |--------------------------------------------------------------------------
    | UPDATE DATA
    |--------------------------------------------------------------------------
    */

    if (req.body.title !== undefined) {
      todo.title = req.body.title;
    }

    if (req.body.category !== undefined) {
      todo.category = req.body.category;
    }

    if (req.body.priority !== undefined) {
      todo.priority = req.body.priority;
    }

    if (req.body.completed !== undefined) {
      todo.completed =
        req.body.completed === true || req.body.completed === "true";
    }

    await todo.save();

    /*
    |--------------------------------------------------------------------------
    | TODO COMPLETED
    |--------------------------------------------------------------------------
    */

    if (!wasCompleted && todo.completed) {
      await createActivity({
        userId,
        type: "todo",
        sourceId: todo._id,
        points: 1,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | TODO UNCOMPLETED
    |--------------------------------------------------------------------------
    */

    if (wasCompleted && !todo.completed) {
      await removeActivity({
        userId,
        type: "todo",
        sourceId: todo._id,
      });
    }

    return res.status(200).json(todo);
  } catch (error) {
    console.error("UPDATE TODO ERROR:", error);

    return res.status(500).json({
      message: "Unable to update todo",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE TODO
|--------------------------------------------------------------------------
*/

const deleteTodo = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid todo ID",
      });
    }

    const todo = await Todo.findOne({
      _id: id,
      user: userId,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    await removeActivity({
      userId,
      type: "todo",
      sourceId: todo._id,
    });

    await todo.deleteOne();

    return res.status(200).json({
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TODO ERROR:", error);

    return res.status(500).json({
      message: "Unable to delete todo",
    });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
