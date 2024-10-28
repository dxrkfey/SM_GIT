const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const line = require("./line");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

const port = 8000;
const secret = "password";
let conn = null;

let lastest_image_name = null;
const IMAGE_DIR = "saved_images";

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "smoke",
  });
};

const checkForSmoke = async () => {
  try {
    const [results] = await conn.query(
      "SELECT * FROM smoke WHERE TimeOfSmoke = 5 AND Status = 'Black' ORDER BY No DESC LIMIT 1"
    );

    if (results.length > 0) {
      const record = results[0];
      const [user] = await conn.query("SELECT Token FROM line");

      if (user.length > 0) {
        const imagePath = path.join(__dirname, "picture", "smoke.jpg");

        line.callLineApi(
          user[0].LineToken,
          "Smoke alert! Smoke is Black",
          imagePath
        );
      }
    }
  } catch (error) {
    console.error("Error checking smoke alert:", error);
  }
};

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await conn.query(`INSERT INTO user (Email, Password) VALUES (?, ?)`, [
    email,
    hash,
  ]);
  res.send("Register Successfully");
});

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const [result] = await conn.query(
//     "SELECT UserID, Password FROM user WHERE Email = ?",
//     [email]
//   );
//   if (result.length === 0 || !result[0].Password) {
//     return res.status(400).send("Wrong Email or Password");
//   }
//   const match = await bcrypt.compare(password, result[0].Password);
//   if (!match) {
//     return res.status(400).send("Wrong Email or Password");
//   }
//   const token = jwt.sign(
//     { email, userID: 2, role: "admin" },
//     // secret,
//     // { expiresIn: "1h" }
//   );

//   res.json({
//     message: "Login Successfully",
//     token,
//     isOk: match,
//   });
// });

app.post("/reset-password", async (req, res) => {
  const conn = await pool.getConnection();
  try {
      const { pass } = req.body;
      const user = isLogin(req);
      if (!user) {
          throw { message: "Auth Fail" };
      }
      const hash = await bcrypt.hash(pass, 10);
      await conn.query("UPDATE users SET Password = ? WHERE ID = ?", [hash, user.userID]);
      conn.release();
      res.status(200).send({ message: "Password updated successfully" }); // Respond with success
  } catch (error) {
      console.log("error", error);
      res.status(500).send({ message: "An error occurred" }); // Handle any errors
  }
});

app.get("/user", async (req, res) => {
  try {
    const user = isLogin(req);
    const [userResult] = await conn.query(`SELECT * FROM user WHERE ID = ?`, [
      user.userID,
    ]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [tokensResult] = await conn.query(
      `SELECT line.LineID, line.Token AS notificationToken 
       FROM line 
       WHERE line.UserID = ?`,
      [user.userID]
    );

    // Map over tokensResult to include both LineID and notificationToken
    const notificationTokens = tokensResult.map((row) => ({
      LineID: row.LineID,
      notificationToken: row.notificationToken,
    }));

    const responseData = {
      ...userResult[0],
      notificationTokens,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error in /user route:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/edit-user", async (req, res) => {
  try {
    const { email, username, company, phone, address, profilePicData } =
      req.body;
    const user = isLogin(req);
    const query = profilePicData
      ? "UPDATE user SET Email = ?, Username = ?, Company = ?, Phone = ?, Address = ?, ProfilePic = ? WHERE ID = ?"
      : "UPDATE user SET Email = ?, Username = ?, Company = ?, Phone = ?, Address = ? WHERE ID = ?";

    const params = profilePicData
      ? [email, username, company, phone, address, profilePicData, user.userID]
      : [email, username, company, phone, address, user.userID];

    await conn.query(query, params);
    res.send("Edit User Successfully");
  } catch (error) {
    console.error("Error in /edit-user:", error);
    res.status(500).send("An error occurred");
  }
});

app.post("/edit-linetoken", async (req, res) => {
  try {
    const { lineToken, lineID } = req.body;
    await conn.query("UPDATE line SET Token = ? WHERE LineID = ?", [
      lineToken,
      lineID,
    ]);
  } catch (error) {
    console.log("error", error);
  }
});

app.post("/add-linetoken", async (req, res) => {
  try {
    const { lineToken } = req.body;
    const user = isLogin(req);
    const lineTokens = Array.isArray(lineToken) ? lineToken : [lineToken];
    const values = lineTokens.map((token) => [token, user.userID]);
    await conn.query("INSERT INTO line (token,UserID) VALUES ?", [values]);
    res.status(200).json({ message: "Tokens added successfully" });
  } catch (error) {
    console.error("Error adding tokens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/remove-linetoken", async (req, res) => {
  try {
    const { lineID } = req.body;
    await conn.query("DELETE from line WHERE LineID = ?", [lineID]);

    res.status(200).json({ message: "Tokens remove successfully" });
  } catch (error) {
    console.error("Error adding tokens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


const initializeLatestImageName = () => {
  try {
    const files = fs
      .readdirSync(IMAGE_DIR)
      .filter((file) => file.endsWith(".jpg"))
      .map((file) => ({
        file,
        time: fs.statSync(path.join(IMAGE_DIR, file)).mtime,
      }))
      .sort((a, b) => b.time - a.time);

    lastest_image_name = files.length > 0 ? files[0].file : null;
  } catch (error) {
    console.error("Error initializing latest image name:", error);
    lastest_image_name = null;
  }
};

initializeLatestImageName();

app.use("/images", express.static(path.join(__dirname, IMAGE_DIR)));

app.get("/smoke", async (req, res) => {
  try {
    const datenow = new Date();
    const currentTime = datenow.getTime();
    const year = datenow.getFullYear();
    const month = String(datenow.getMonth() + 1).padStart(2, "0");
    const day = String(datenow.getDate()).padStart(2, "0");
    const hour = String(datenow.getHours()).padStart(1, "0");
    const minute = String(datenow.getMinutes()).padStart(1, "0");

    const [result] = await conn.query(
      `SELECT No, StartTime, EndTime, Done, TimeOfSmoke 
       FROM smoke
       ORDER BY No DESC
       LIMIT 1`
    );
    let data = result[0] || {};

    const [timeResult] = await conn.query(
      `SELECT SUM(TIME_TO_SEC(TimeOfSmoke)) AS totalTimeOfSmoke 
       FROM smoke 
       WHERE DATE(StartTime) = CURDATE()`
    );
    const totalTimeOfSmoke = timeResult[0]?.totalTimeOfSmoke || 0;
    const [countResult] = await conn.query(
      `SELECT COUNT(*) AS todayCount 
       FROM smoke 
       WHERE DATE(StartTime) = CURDATE()`
    );
    const todayCount = countResult[0]?.todayCount || 0;
    const fileName = `${day}-${month}-${year}.${hour}h-${minute}.jpg`;
    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/images/${lastest_image_name}`;

    let smokeStatus = 0;
    let percentageBlack = 0;

    if (data.StartTime) {
      const startTime = new Date(data.StartTime).getTime();
      const endTime = data.EndTime ? new Date(data.EndTime).getTime() : null;
      if (!data.Done && currentTime >= startTime) {
        smokeStatus = 1;
      }
      const totalSecondsInDay = 86400;
      percentageBlack = ((totalTimeOfSmoke / totalSecondsInDay) * 100).toFixed(
        2
      );
    }

    if (smokeStatus === 0) {
      data = null;
    }
    const responseData = {
      data: data,
      imageUrl: imageUrl,
      todayCount: todayCount,
      smokeStatus: smokeStatus,
      percentageBlack: percentageBlack,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching smoke data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/filter-smoke", async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const totalTimeInRangeSeconds = (endDate - startDate) / 1000;
    const [filteredData] = await conn.query(
      "SELECT * FROM smoke WHERE StartTime BETWEEN ? AND ?",
      [startDate, endDate]
    );
    const [longestSmokeEvent] = await conn.query(
      `SELECT * FROM smoke WHERE StartTime BETWEEN ? AND ? 
       ORDER BY TIME_TO_SEC(TimeOfSmoke) DESC LIMIT 1`,
      [startDate, endDate]
    );
    let totalSmokeTimeSeconds = 0;
    filteredData.forEach((event) => {
      const timeParts = event.TimeOfSmoke.split(":");
      const seconds = +timeParts[0] * 3600 + +timeParts[1] * 60 + +timeParts[2];
      totalSmokeTimeSeconds += seconds;
    });
    const smokeTimePercentage =
      (totalSmokeTimeSeconds / totalTimeInRangeSeconds) * 100;
    res.status(200).json({
      totalRecords: filteredData.length,
      filteredData,
      longestSmokeEvent:
        longestSmokeEvent.length > 0 ? longestSmokeEvent[0] : null,
      totalSmokeTime: formatTime(totalSmokeTimeSeconds), // formatted as hh:mm:ss
      smokeTimePercentage: smokeTimePercentage.toFixed(2) + "%",
    });
  } catch (error) {
    console.error("Error filtering smoke events:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

app.post("/add-smoke", async (req, res) => {
  try {
    console.log(req.body);
    const { result, img_name } = req.body;
    lastest_image_name = img_name;
    const [lastRecord] = await conn.query(
      "SELECT No, Done, StartTime FROM smoke ORDER BY No DESC LIMIT 1"
    );
    const isoTime = new Date();
    const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
      return `${h}:${m}:${s}`;
    };

    if (
      (lastRecord[0] == null && result == true) ||
      (lastRecord[0].Done && result == true)
    ) {
      await conn.query(
        "INSERT INTO smoke (StartTime, EndTime, Done) VALUES (?, ?, 0)",
        [isoTime, isoTime]
      );
    } else {
      const startTime = new Date(lastRecord[0].StartTime);
      const timeOfSmokeSeconds = (isoTime - startTime) / 1000;
      const timeOfSmokeFormatted = formatTime(timeOfSmokeSeconds);

      if (result) {
        await conn.query(
          "UPDATE smoke SET EndTime = ?, TimeOfSmoke = ? WHERE No = ?",
          [isoTime, timeOfSmokeFormatted, lastRecord[0].No]
        );
      } else if (!lastRecord[0].Done) {
        await conn.query(
          "UPDATE smoke SET EndTime = ?, Done = ?, TimeOfSmoke = ? WHERE No = ?",
          [isoTime, true, timeOfSmokeFormatted, lastRecord[0].No]
        );
      }
    }
    console.log("success add");
    res.status(200).json({ message: "Smoke event processed successfully" });
  } catch (error) {
    console.error("Detailed Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.listen(port, async () => {
  await initMySQL();
  console.log("run at" + port);
});

// const isLogin = (req) => {
//   const authHeader = req.headers["authorization"];
//   let authToken = "";
//   if (authHeader) {
//     authToken = authHeader.split(" ")[1];
//   }
//   const user = jwt.verify(authToken, secret);

//   if (authToken) {
//     return user;
//   } else {
//     return null;
//   }
// };

const isLogin = (req) => {
  return {
    email: "admin@gmail.com",
    userID: 2,
  };
};
