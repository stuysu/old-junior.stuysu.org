const{Model:Model}=require("sequelize");module.exports=(e,s)=>{class l extends Model{}return l.init({sub:{type:s.STRING,primaryKey:!0}},{sequelize:e,modelName:"Subs"}),l};
