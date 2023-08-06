//REQUERIMIENTOS
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'mydatabase',
});


// Ruta para el registro de usuarios
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
 
 // Verificar si el usuario o el email ya existen en la base de datos
  connection.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      if (result.length > 0) {
        return res.status(409).json({ error: 'Usuario o email ya existe' });
      }
      // Si el usuario y el email no existen, hashear la contraseña
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
      


  // Insertar el nuevo usuario en la base de datos
        connection.query(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hash],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error interno del servidor' });
            }
            res.status(201).json({ message: 'Registro exitoso' });
          }
        );
      });
    }
  );
});
// Ruta para el inicio de sesión de usuarios
app.post('/login', (req, res) => {
  const { username, password } = req.body;

//Rutas GET
  // Ruta para obtener información de un usuario
app.get('/users/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;



  // Consultar la base de datos para obtener la información del usuario
  connection.query(
    'SELECT id, username, email FROM users WHERE id = ?',
    [userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      const user = result[0];
      res.status(200).json(user);
    }
  );
});



//AUTH TOKEN
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  jwt.verify(token, 'AQUI VA TOKEN OBTENIDO', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Buscar el usuario en la base de datos
  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      if (result.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar la contraseña
      bcrypt.compare(password, result[0].password, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (!isMatch) {
          return res.status(401).json({ error: 'Informacion incorrecta' });
        }
        // Crear un token JWT y enviarlo como respuesta
        const token = jwt.sign({ userId: result[0].id }, 'AQUI VA TOKEN OBTENIDO', {
          expiresIn: '1h',
        });
        res.status(200).json({ token });
      });
    }
  );
});



// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});




//RUTAS

//registrar alumnos a una clase

app.post('/registrar-alumno', (req, res) => {
  const { nombre, edad, curso } = req.body;
  const alumno = { nombre, edad, curso };

  connection.query('INSERT INTO alumnos SET ?', alumno, (err, result) => {
    if (err) {
      console.error('Error al registrar el alumno:', err);
      res.status(500).json({ error: 'Error al registrar el alumno' });
    } else {
      console.log('Alumno registrado con éxito:', result);
      res.status(201).json({ message: 'Alumno registrado con éxito' });
    }
  });
});
