const{Model:Model}=require("sequelize");module.exports=(e,l)=>{class t extends Model{}return t.init({url:{type:l.STRING,primaryKey:!0},views:{type:l.STRING},tracking:{type:l.BOOLEAN}},{sequelize:e,modelName:"Analytics"}),t};
