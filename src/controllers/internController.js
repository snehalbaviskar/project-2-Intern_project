const { default: mongoose } = require("mongoose")
const collegeModel = require("../model/collegeModel")
const internModel = require("../model/internModel")
const validateEmail = require('email-validator')

const isValidReqBody = function (reqBody) {
    return Object.keys(reqBody).length > 0
}
const isValid = function (value) {
    if (typeof value === 'undefined' || typeof value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const validPhone = function (mobile) {
    return mobile.trim().length > 9 && mobile.trim().length < 11
}

let createIntern = async function (req, res) {
    try {
        if (!isValidReqBody(req.body)) return res.status(400).send({ status: false, msg: "Invalid parameters.Please provide intern details" })
        let { name, email, collegeName, mobile } = req.body

        if (!isValid(name)) return res.status(400).send({ status: false, msg: "intern name is required" })

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is required" })
        if (!validateEmail.validate(email)) return res.status(400).send({ status: false, msg: `${email} this email is not valid` })
        
        let duplicateEmail = await internModel.findOne({ email })
        if (duplicateEmail) return res.status(400).send({ status: false, msg: `intern exist with this email ${email}` })

        if (!isValid(mobile)) return res.status(400).send({ status: false, msg: "mobile number is required" })
        if (!validPhone(mobile)) return res.status(400).send({ status: false, msg: "mobile number is not valid" })

        let duplicateMobile = await internModel.findOne({ mobile })
        if (duplicateMobile) return res.status(400).send({ status: false, msg: `intern exist with this mobile number ${mobile}` })

        if (!isValid(collegeName)) {
            res.status(400).send({ status: false, message: `CollegeName is required` })
            return
        }

       let collegeDetail = await collegeModel.findOne({ name: collegeName, isDeleted: false });
       console.log(collegeDetail)
       if (!collegeDetail) return res.status(400).send({ status: false, msg: "No such college found" })
       let { _id } = collegeDetail;
       // console.log(collegeDetail)
       // console.log(_id )
       req.body["collegeId"] = _id

        let list = await internModel.create(req.body)
        res.status(201).send({ status: true, msg: "intern created successfully", data: list })


  }catch(err){
      res.status(500).send({status:false,error:err.message})
  }
}

let collegeDetails = async function (req, res) {
    try {

        if (!isValid(req.query.collegeName)) return res.status(400).send({ status: false, msg: "Give collegeName" })

        let collegeDetails = await collegeModel.findOne({ name: req.query.collegeName, isDeleted: false })


        if (!collegeDetails) return res.status(404).send({ status: false, msg: "College Not Found" })
       // console.log(collegeDetails)

        let internList = await internModel.find({ collegeId: collegeDetails._id, isDeleted: false }).select({_id:1, name: 1, email: 1, mobile: 1 })
        if (internList.length === 0) return res.status(404).send({ status: false, msg: "no intern applied for this college" })


       let { name, fullName, logoLink} = collegeDetails
 

        let college = { name, fullName, logoLink, interests:internList};
       
        res.status(200).send({status:true,data:college}) 

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = {
    createIntern, collegeDetails
}
