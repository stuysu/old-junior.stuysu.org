const express=require("express"),router=express.Router(),{sequelize:sequelize}=require("./../../models"),Events=sequelize.models.Events,{CreateError:CreateError}=require("../utils"),{requireAuthApi:requireAuthApi}=require("../auth");router.get("/events",(async(t,e,d)=>{if(t.query.id)try{let d=await Events.findByPk(t.query.id);e.status(200).json(d||{})}catch(t){d(CreateError(400,t))}else try{let t=await Event.findAll();e.status(200).json(t)}catch(t){d(CreateError(400,t))}})),router.post("/events",requireAuthApi(),((t,e,d)=>{void 0!==t.body.title&&void 0!==t.body.date||d(CreateError(400,"Excpected title and date, only one or neither found")),Events.create({title:t.body.title,date:t.body.date,description:t.body.description,url:t.body.url,poster:t.body.poster,isImportant:t.body.isImportant,isHidden:t.body.isHidden}).then((d=>{e.status(200).json({created:!0,title:t.body.title,date:t.body.date,description:t.body.description,url:t.body.url,poster:t.body.poster,isImportant:t.body.isImportant,isHidden:t.body.isHidden,id:d.id})})).catch((t=>{d(CreateError(400,t))}))})),router.put("/events",requireAuthApi(),(async(t,e,d)=>{try{let d=await Events.findByPk(t.body.id),i={found:null!==d};if(i.found){const e=void 0!==t.body.title,o=void 0!==t.body.date,r=void 0!==t.body.description,s=void 0!==t.body.url,a=void 0!==t.body.poster,n=void 0!==t.body.isImportant,p=void 0!==t.body.isHidden,u={where:{id:t.body.id}};i.old={title:void 0!==t.body.title?d.title:void 0,date:void 0!==t.body.date?d.date:void 0,description:void 0!==t.body.description?d.description:void 0,url:void 0!==t.body.url?d.url:void 0,poster:void 0!==t.body.poster?d.poster:void 0,isImportant:void 0!==t.body.isImportant?d.isImportant:void 0,isHidden:void 0!==t.body.isHidden?d.isHidden:void 0},await Events.update({title:t.body.title,date:t.body.date,description:t.body.description,url:t.body.url,poster:t.body.poster,isImportant:t.body.isImportant,isHidden:t.body.isHidden},u),i.title=t.body.title,i.date=t.body.date,i.description=t.body.description,i.url=t.body.url,i.poster=t.body.poster,i.isImportant=t.body.isImportant,i.isHidden=t.body.isHidden,i.updatedTitle=e?i.title!==d.title:void 0,i.updatedDate=o?i.date!==d.date:void 0,i.updatedDescription=r?i.description!==d.description:void 0,i.updatedUrl=s?i.url!==d.url:void 0,i.updatedPoster=a?i.poster!==d.poster:void 0,i.updatedIsImportant=n?i.isImportant!==d.isImportant:void 0,i.updatedIsHidden=p?i.isHidden!==d.isHidden:void 0}e.status(200).json(i)}catch(t){d(CreateError(400,t))}})),router.delete("/events/:id",requireAuthApi(),(async(t,e,d)=>{try{let d=await Events.destroy({where:{id:t.params.id}});e.status(200).json({deleted:1==d,id:t.params.id})}catch(t){d(CreateError(400,t))}})),module.exports=router;
