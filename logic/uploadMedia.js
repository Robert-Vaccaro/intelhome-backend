// var multer = require('multer');
// var multerS3 = require('multer-s3');
// const { s3 } = require('../config/s3');
// const { users } = require('../schemas/user');

// const uploadS3 = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.bucket,
//         metadata: (req, file, callBack) => {
//             callBack(null, { fieldName: file.fieldname })
//         },
//         key: (req, file, callBack) => {
//             let filenameSplit = file.originalname.split('__split__')
//             let userId = filenameSplit[0]
//             let inspectionID = filenameSplit[1].split("_num_")[0].split(".jpeg")
//             let fileCount = filenameSplit[1].split("_num_")[1].split(".jpeg")[0]
//             //use Date.now() for unique file keys
//             users.findOne({userId:userId}).then(function(userDoc) {
//               if (userDoc.banned === "false") {
//                   inspections.findOne({inspectionID:inspectionID}).then(function(inspectionDoc){
//                     if (inspectionDoc) {
//                         console.log("Found inspection")
//                         let urlString = userId + "/inspections/" + inspectionID + "/" + fileCount + ".jpeg"
//                         inspectionDoc.imageURL.push(process.env.awsLink +
//                           urlString)
//                           callBack(null, urlString)
//                         inspectionDoc.save()
//                     } else {
//                         console.log("Couldn't find inspection")
//                     }
//                   })
//               } else {
//                   console.log("Banned")
//               }
//             })
//             }
            
        
//     })
//   }).array('upload_data', 4);
  
// exports.uploadProductsImages = async (req, res) => {
//     uploadS3(req, res, (error) => {
//         if (error) {
//             console.log('errors with uploadS3');
//             res.status(500).json({
//                 status: 'fail',
//                 // error: error
//             });
//         } else {
//             // If File not found
//             if (req.files === undefined) {
//                 console.log('uploadProductsImages Error: No File Selected!');
//                 res.status(500).json({
//                     status: 'fail',
//                     message: 'Error: No File Selected'
//                 });
//             } else {
//                 // If Success
//                 let fileArray = req.files,
//                     fileLocation;
//                 const images = [];
//                 for (let i = 0; i < fileArray.length; i++) {
//                     fileLocation = fileArray[i].location;
//                     images.push(fileLocation)
//                 }
//                 // Save the file name into database
//                 return res.status(200).json({
//                     status: 'ok',
//                     // filesArray: fileArray,
//                     // locationArray: images
//                 });
  
//             }
//         }
//     })
//   };