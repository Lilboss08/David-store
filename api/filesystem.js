import fs from "fs";

// reading a file synchronously using filesystem module
// let content = fs.readFileSync("product.json", "utf-8");
fs.readFile("product.json", "utf-8", (err, data) => {
    if (err) {
        console.log(err);   
    } else {
        console.log(data);    }
}
);



// writting the content to a new file using filesystem module
// fs.writeFileSync("product2.json", content, "utf-8");

// updating the content of the file using filesystem module
fs.appendFileSync("product2.json", "this is a product \nfile that was updated", "utf-8");


// deleting the file using filesystem module
// fs.unlinkSync("css.txt", "utf-8");
fs.unlink("css.txt", (err) => {
    if (err) {
        console.log(err);   
    } else {
        console.log("file deleted successfully");
    }});



// open an empty file using filesystem module
fs.openSync("empty.txt", "w");
fs.renameSync("empty.txt", "empty2.txt");





