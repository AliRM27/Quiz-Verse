import DailyQuiz from "../models/DailyQuiz.js";
import { WeeklyEvent } from "../models/WeeklyEvent.js";

// --- Daily Quiz Controllers ---

export const getDailyQuizzes = async (req, res) => {
  try {
    const quizzes = await DailyQuiz.find().sort({ dateKey: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily quizzes", error });
  }
};

export const getDailyQuizById = async (req, res) => {
  try {
    const quiz = await DailyQuiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Daily Quiz not found" });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily quiz", error });
  }
};

export const createDailyQuiz = async (req, res) => {
  try {
    const newQuiz = new DailyQuiz(req.body);
    await newQuiz.save();
    res
      .status(201)
      .json({ message: "Daily Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    res.status(400).json({ message: "Error creating daily quiz", error });
  }
};

export const updateDailyQuiz = async (req, res) => {
  try {
    const updatedQuiz = await DailyQuiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedQuiz)
      return res.status(404).json({ message: "Daily Quiz not found" });
    res
      .status(200)
      .json({ message: "Daily Quiz updated successfully", quiz: updatedQuiz });
  } catch (error) {
    res.status(400).json({ message: "Error updating daily quiz", error });
  }
};

export const deleteDailyQuiz = async (req, res) => {
  try {
    const deletedQuiz = await DailyQuiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz)
      return res.status(404).json({ message: "Daily Quiz not found" });
    res.status(200).json({ message: "Daily Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting daily quiz", error });
  }
};

// --- Weekly Event Controllers ---

export const getWeeklyEvents = async (req, res) => {
  try {
    const events = await WeeklyEvent.find().sort({ startsAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching weekly events", error });
  }
};

export const getWeeklyEventById = async (req, res) => {
  try {
    const event = await WeeklyEvent.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Weekly Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching weekly event", error });
  }
};

export const createWeeklyEvent = async (req, res) => {
  try {
    const newEvent = new WeeklyEvent(req.body);
    await newEvent.save();
    res
      .status(201)
      .json({ message: "Weekly Event created successfully", event: newEvent });
  } catch (error) {
    res.status(400).json({ message: "Error creating weekly event", error });
  }
};

export const updateWeeklyEvent = async (req, res) => {
  try {
    const updatedEvent = await WeeklyEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedEvent)
      return res.status(404).json({ message: "Weekly Event not found" });
    res
      .status(200)
      .json({
        message: "Weekly Event updated successfully",
        event: updatedEvent,
      });
  } catch (error) {
    res.status(400).json({ message: "Error updating weekly event", error });
  }
};

export const deleteWeeklyEvent = async (req, res) => {
  try {
    const deletedEvent = await WeeklyEvent.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ message: "Weekly Event not found" });
    res.status(200).json({ message: "Weekly Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting weekly event", error });
  }
};
