const mongoose = require("mongoose");

const uri = "mongodb://localhost:27017/local-experiments";

async function main() {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const TestSchema = new mongoose.Schema(
    {
      title: String,
      access: [Number],
      description: String,
      date: Date,
    },
    { strictQuery: false }
  );

  TestSchema.virtual("enterpriseId").set(function (enterpriseId) {
    const access = [];

    if (enterpriseId) {
      access.push(Number(`${enterpriseId}`));
    }

    this.access = access;
  });

  TestSchema.pre("save", async function () {
    console.log(this.title);
    console.log(this.access);
    console.log(this.enterpriseId);
    console.log(this.description);
    console.log(this.date);

    this.date = new Date();
  });

  const TestModel = mongoose.model("TestModel", TestSchema, "testModel");

  const t = new TestModel({ title: "abc", enterpriseId: 5555 });
  t.save();
}

main();
