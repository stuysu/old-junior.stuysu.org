const{Model:Model}=require("sequelize");module.exports=(e,t)=>{class l extends Model{}return l.init({id:{type:t.INTEGER,primaryKey:!0,autoIncrement:!0,validate:{min:0}},title:{type:t.TEXT,allowNull:!1},date:{type:t.BIGINT,allowNull:!1},description:{type:t.TEXT},url:{type:t.TEXT},poster:{type:t.TEXT},isImportant:{type:t.BOOLEAN},isHidden:{type:t.BOOLEAN}},{sequelize:e,modelName:"Events"}),l};
