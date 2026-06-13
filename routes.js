const express = require('express');
const router = express.Router();
const db = require('./db');

// GET semua tasks milik user
router.get('/tasks/:id_pengguna', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, c.nama_kategori, c.warna_hex 
      FROM tasks t
      LEFT JOIN categories c ON t.id_kategori = c.id_kategori
      WHERE t.id_pengguna = ?
    `, [req.params.id_pengguna]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah task baru
router.post('/tasks', async (req, res) => {
  try {
    const { id_pengguna, judul, notes, due_date, remind_at, id_kategori } = req.body;
    const [result] = await db.query(`
      INSERT INTO tasks (id_pengguna, judul, notes, due_date, remind_at, id_kategori)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id_pengguna, judul, notes, due_date, remind_at, id_kategori]);
    res.json({ message: 'Task berhasil ditambahkan', id_task: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update status selesai
router.put('/tasks/:id_task', async (req, res) => {
  try {
    const { selesai } = req.body;
    await db.query(`UPDATE tasks SET selesai = ? WHERE id_task = ?`,
      [selesai, req.params.id_task]);
    res.json({ message: 'Task berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
router.delete('/tasks/:id_task', async (req, res) => {
  try {
    await db.query(`DELETE FROM tasks WHERE id_task = ?`, [req.params.id_task]);
    res.json({ message: 'Task berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;
    const [rows] = await db.query(`
      SELECT * FROM data_pengguna WHERE email = ?
    `, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }
    const user = rows[0];
    if (user.kata_sandi !== kata_sandi) {
      return res.status(401).json({ message: 'Password salah' });
    }
    res.json({ message: 'Login berhasil', user: { id_pengguna: user.id_pengguna, nama_depan: user.nama_depan, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET profil pengguna
router.get('/pengguna/:id_pengguna', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_pengguna, nama_depan, nama_belakang, email
      FROM data_pengguna WHERE id_pengguna = ?
    `, [req.params.id_pengguna]);
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET notifikasi
router.get('/notifikasi/:id_pengguna', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM notifications_log
      WHERE id_pengguna = ?
      ORDER BY dikirim_pada DESC
    `, [req.params.id_pengguna]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT tandai notifikasi sudah dibaca
router.put('/notifikasi/:id_notif/baca', async (req, res) => {
  try {
    await db.query(`UPDATE notifications_log SET status_baca = 1 WHERE id_notif = ?`,
      [req.params.id_notif]);
    res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET subtasks per task
router.get('/subtasks/:id_task', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM sub_tasks WHERE id_task = ?
    `, [req.params.id_task]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah subtask
router.post('/subtasks', async (req, res) => {
  try {
    const { id_task, nama_subtask } = req.body;
    const [result] = await db.query(`
      INSERT INTO sub_tasks (id_task, nama_subtask) VALUES (?, ?)
    `, [id_task, nama_subtask]);
    res.json({ message: 'Sub task berhasil ditambahkan', id_subtask: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update status subtask
router.put('/subtasks/:id_subtask', async (req, res) => {
  try {
    const { status_selesai } = req.body;
    await db.query(`UPDATE sub_tasks SET status_selesai = ? WHERE id_subtask = ?`,
      [status_selesai, req.params.id_subtask]);
    res.json({ message: 'Sub task berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE subtask
router.delete('/subtasks/:id_subtask', async (req, res) => {
  try {
    await db.query(`DELETE FROM sub_tasks WHERE id_subtask = ?`, [req.params.id_subtask]);
    res.json({ message: 'Sub task berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET kategori
router.get('/kategori/:id_pengguna', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM categories 
      WHERE id_pengguna = ? OR id_pengguna IS NULL
      ORDER BY id_pengguna IS NULL DESC, nama_kategori ASC
    `, [req.params.id_pengguna]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah kategori
router.post('/kategori', async (req, res) => {
  try {
    const { id_pengguna, nama_kategori, warna_hex } = req.body;
    const [result] = await db.query(`
      INSERT INTO categories (id_pengguna, nama_kategori, warna_hex)
      VALUES (?, ?, ?)
    `, [id_pengguna, nama_kategori, warna_hex]);
    res.json({ message: 'Kategori berhasil ditambahkan', id_kategori: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE kategori
router.delete('/kategori/:id_kategori', async (req, res) => {
  try {
    await db.query(`DELETE FROM categories WHERE id_kategori = ?`, [req.params.id_kategori]);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;