const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const s3CLient = new S3Client({
  region: "",
  credentials: {},
});

const PROJECT_ID = process.env.PROJECT_ID;

async function init() {
  console.log("Building script.js");

  const outDirPath = path.join(__dirname, "output"); //path for the output directory.

  const p = exec(`cd ${outDirPath} && npm install && npm run build`); //in the output folder install the npm depencencies (node modules) and build it.

  p.stdout.on("data", function (data) {
    console.log(data.toString());
  }); //all the logs in the output folder are stored in data(buffer) , it is then console logged by converting it into string.

  p.stdout.on("error", function (data) {
    console.log("Error", data.toString());
  }); // similar to prev function, here errors are console logged.

  p.on("close", async function () {
    console.log("Build complete");
    const distFolderPath = path.join(__dirname, "output", "dist"); //dist folder - static files.
    const distFolderContent = fs.readdirSync(distFolderPath, {
      recursive: true,
    }); //read contents of dist folder.

    for (const file of distFolderContent) {
      const filePath = path.join(distFolderPath, file); //complete path of the file. coz "file" has only relative path.
      if (fs.lstatSync(filePath).isDirectory()) continue; //if content is a directory then continue else upload on s3
      console.log("Uploading file path:", filePath);

      //Put objects in s3 bucket.
      const command = new PutObjectCommand({
        Bucket: "revolt-bucket",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3CLient.send(command);

      console.log("Uploaded file path:", filePath);
    }

    console.log("Done...");
  });
}

init();
