var express = require("express");
var router = express.Router();
const { ObjectId } = require("mongodb");
const { mongodb, dbName, dbUrl, MongoClient } = require("./../config/dbConfig");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// Api route to create new student

router.post("/create-student", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const db = client.db(dbName);
    await db.collection("students").insertOne(req.body);
    console.log("inserted student data into students collection");
    res.status(201).send({ message: "student created sucessfully" });
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

//create mentor

router.post("/create-mentor", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const db = client.db(dbName);
    await db.collection("mentor").insertOne(req.body);
    res.status(201).send({ message: "mentor created sucessfully" });
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// route to get student

router.get("/student", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const db = client.db(dbName);
    const data = await db.collection("students").find().toArray();
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});
//route to get mentor
router.get("/mentor", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const db = client.db(dbName);
    const data = await db.collection("mentor").find().toArray();
    console.log(data);
    res.status(200).send(data);
    client.close();
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// get student  with particular id

router.get("/student/:id", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const db = client.db(dbName);
    const data = await db.collection("student").findOne({
      _id: new ObjectId(req.params.id),
    });
    console.log(data);
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// get mentor data with particular id

router.get("/mentor/:id", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const db = client.db(dbName);
    const data = await db
      .collection("mentor")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// Api route to assign or change mentor of a particular student

router.patch("/student/:id/assign-mentor", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    let db = client.db(dbName);
    await db
      .collection("students")
      .update(
        { _id: mongodb.ObjectId(req.params) },
        { $set: { mentor_assigned: mongodb.ObjectId(req.body) } }
      );
    await db
      .collection("mentor")
      .update(
        { _id: mongodb.ObjectId(req.body) },
        { $push: { studentIdList: mongodb.ObjectId(req.params.id) } }
      );
    res.status(201).send({
      message: `mentor assigned to student of id ${id} is successfully`,
    });
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// Api route to assign multiple students to mentor

router.patch("/mentor/:id/assign-student", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    const { studentList } = req.body;
    let db = client.db(dbName);
    await db
      .collection("mentor")
      .update(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: { studentIdList: studentList } }
      );
    studentList.map((e) => {
      let student = db
        .collection("students")
        .findOne({ _id: mongodb.ObjectId(e) });
      if (student)
        db.collection("students").update(
          { _id: mongodb.ObjectId(e) },
          { $set: { mentor_assigned: mongodb.ObjectId(req.params.id) } }
        );
    });
    res.status(201).send({
      message: `students assigned to mentor of id ${id} successfully`,
    });
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// Api route to show all students of a particular mentor

router.get("/mentor/:id/studentlist", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    let db = client.db(dbName);
    let data = await db
      .collection("mentor")
      .find({ _id: mongodb.ObjectId(req.params.id) })
      .project({ studentIdList: 1, _id: 0 })
      .toArray();
    res.status(201).send(data);
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

// Api route to delete particular  mentor or student

router.delete("/remove-mentor/:id", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    let db = client.db(dbName);
    await db
      .collection("mentors")
      .findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });
    await db
      .collection("students")
      .update(
        { mentor_assigned: mongodb.ObjectId(req.params.id) },
        { $set: { assigned_mentorId: "" } }
      );
    res.status(200).send({ message: `mentor with id ${id} is Removed` });
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

router.delete("/remove-student/:id", async (req, res) => {
  const client = new MongoClient(dbUrl);
  await client.connect();
  try {
    let db = client.db(dbName);
    await db
      .collection("students")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) });
    let data = await db
      .collection("mentor")
      .update(
        { studentIdList: { $in: [mongodb.ObjectId(req.params.id)] } },
        { $pop: { studentIdList: mongodb.ObjectId(req.params.id) } }
      ); //
    res.status(201).send({ message: `student with id ${id} is Removed` });
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
});

module.exports = router;
