// routes/workouts.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Firestore з firebase-admin
const checkFirebaseToken = require('../middleware/auth');

// ========================
// 1) CRUD для Workouts
// ========================

// Створення тренування
router.post('/', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutName, duration, description } = req.body;
        const newWorkout = {
            created_at: new Date().toISOString(),
            userId,
            workoutName,
            duration,
            description,
        };
        const docRef = await db.collection('workouts').add(newWorkout);
        res.status(201).json({ id: docRef.id, ...newWorkout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating workout' });
    }
});

// Отримання всіх тренувань користувача
router.get('/', checkFirebaseToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('workouts')
            .where('userId', '==', userId)
            .get();
        const workouts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(workouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching workouts' });
    }
});

// Отримання окремого тренування
router.get('/:id', checkFirebaseToken, async (req, res) => {
    try {
        const docRef = db.collection('workouts').doc(req.params.id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = docSnap.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({ id: docSnap.id, ...workout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching workout' });
    }
});

// Оновлення тренування
router.put('/:id', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutName } = req.body;
        const docRef = db.collection('workouts').doc(req.params.id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = docSnap.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await docRef.update({ workoutName });
        res.json({ message: 'Workout updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating workout' });
    }
});

// Видалення тренування
router.delete('/:id', checkFirebaseToken, async (req, res) => {
    try {
        const docRef = db.collection('workouts').doc(req.params.id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = docSnap.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await docRef.delete();
        res.json({ message: 'Workout deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting workout' });
    }
});

// ========================
// 2) CRUD для Exercises
// ========================

// Створення вправи для тренування
router.post('/:workoutId/exercises', checkFirebaseToken, async (req, res) => {
    try {

        const { workoutId } = req.params;
        const { muscles, name, time, description } = req.body;

        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = workoutDoc.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const newExercise = { muscles, name, time, description, workoutId };
        const docRef = await db.collection('exercises').add(newExercise);
        res.status(201).json({ id: docRef.id, ...newExercise });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating exercise' });
    }
});

// Отримання всіх вправ для тренування
router.get('/:workoutId/exercises', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId } = req.params;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = workoutDoc.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const snapshot = await db.collection('exercises')
            .where('workoutId', '==', workoutId)
            .get();
        const exercises = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(exercises);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching exercises' });
    }
});

// Отримання однієї вправи
router.get('/:workoutId/exercises/:exerciseId', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = workoutDoc.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const exercise = exerciseDoc.data();
        if (exercise.workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        res.json({ id: exerciseDoc.id, ...exercise });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching exercise' });
    }
});

// Оновлення вправи
router.put('/:workoutId/exercises/:exerciseId', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const { muscles, name, time } = req.body;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = workoutDoc.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseRef = db.collection('exercises').doc(exerciseId);
        const exerciseDoc = await exerciseRef.get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const exercise = exerciseDoc.data();
        if (exercise.workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        await exerciseRef.update({ muscles, name, time });
        res.json({ message: 'Exercise updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating exercise' });
    }
});

// Видалення вправи
router.delete('/:workoutId/exercises/:exerciseId', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = workoutDoc.data();
        if (workout.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseRef = db.collection('exercises').doc(exerciseId);
        const exerciseDoc = await exerciseRef.get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const exercise = exerciseDoc.data();
        if (exercise.workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        await exerciseRef.delete();
        res.json({ message: 'Exercise deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting exercise' });
    }
});

// ========================
// 3) CRUD для Approaches
// ========================

// Створення підходу для вправи
router.post('/:workoutId/exercises/:exerciseId/approaches', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const { number, reps, weight, description } = req.body;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        if (workoutDoc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        if (exerciseDoc.data().workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        const newApproach = { exerciseId, number, reps, weight, description };
        const docRef = await db.collection('approaches').add(newApproach);
        res.status(201).json({ id: docRef.id, ...newApproach });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating approach' });
    }
});

// Отримання всіх підходів для вправи
router.get('/:workoutId/exercises/:exerciseId/approaches', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        if (workoutDoc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        if (exerciseDoc.data().workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        const snapshot = await db.collection('approaches')
            .where('exerciseId', '==', exerciseId)
            .get();
        const approaches = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(approaches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching approaches' });
    }
});

// Отримання одного підходу
router.get('/:workoutId/exercises/:exerciseId/approaches/:approachId', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId, approachId } = req.params;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        if (workoutDoc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        if (exerciseDoc.data().workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        const approachDoc = await db.collection('approaches').doc(approachId).get();
        if (!approachDoc.exists) {
            return res.status(404).json({ error: 'Approach not found' });
        }
        const approach = approachDoc.data();
        if (approach.exerciseId !== exerciseId) {
            return res.status(403).json({ error: 'Approach does not belong to this exercise' });
        }
        res.json({ id: approachDoc.id, ...approach });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching approach' });
    }
});

// Оновлення підходу
router.put('/:workoutId/exercises/:exerciseId/approaches/:approachId', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId, approachId } = req.params;
        const { number, reps, weight } = req.body;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        if (workoutDoc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        if (exerciseDoc.data().workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        const approachRef = db.collection('approaches').doc(approachId);
        const approachDoc = await approachRef.get();
        if (!approachDoc.exists) {
            return res.status(404).json({ error: 'Approach not found' });
        }
        if (approachDoc.data().exerciseId !== exerciseId) {
            return res.status(403).json({ error: 'Approach does not belong to this exercise' });
        }
        await approachRef.update({ number, reps, weight });
        res.json({ message: 'Approach updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating approach' });
    }
});

// Видалення підходу
router.delete('/:workoutId/exercises/:exerciseId/approaches/:approachId', checkFirebaseToken, async (req, res) => {
    try {
        const { workoutId, exerciseId, approachId } = req.params;
        const workoutDoc = await db.collection('workouts').doc(workoutId).get();
        if (!workoutDoc.exists) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        if (workoutDoc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const exerciseDoc = await db.collection('exercises').doc(exerciseId).get();
        if (!exerciseDoc.exists) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        if (exerciseDoc.data().workoutId !== workoutId) {
            return res.status(403).json({ error: 'Exercise does not belong to this workout' });
        }
        const approachRef = db.collection('approaches').doc(approachId);
        const approachDoc = await approachRef.get();
        if (!approachDoc.exists) {
            return res.status(404).json({ error: 'Approach not found' });
        }
        if (approachDoc.data().exerciseId !== exerciseId) {
            return res.status(403).json({ error: 'Approach does not belong to this exercise' });
        }
        await approachRef.delete();
        res.json({ message: 'Approach deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting approach' });
    }
});

module.exports = router;
