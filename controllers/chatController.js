const path = require("path");
const sequelize = require("../util/database");
const { json } = require("sequelize");
const User = require("../models/user");
const Message = require('../models/message');
const Group = require('../models/group');
const GroupUser = require('../models/groupUser');

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/chat.html"));
};

exports.addChat = async (req, res, next) => {
  const msg = req.body.message;
  const groupId = req.body.groupId;

  const t = await sequelize.transaction();
  try {
    const result = await Message.create(
      {
        message: msg,
        userId: req.user.id,
        username: req.user.name,
        GroupGroupId: groupId,
      },
      { transaction: t }
    );

    // Only retrieve the latest 10 messages
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    await t.commit();
    res.status(201).json(messages);
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllMesssages = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllUsers =  async (req, res, next) => {
  try {
    const users = await User.findAll({}, 'name');
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

exports.getGroupData = async (req, res, next) => {
  try {
    const groupData = await GroupUser.findAll();

    if (!groupData || groupData.length === 0) {
      return res.status(404).json({ error: 'No group data found' });
    }

    res.json({ groupData });
  } catch (error) {
    console.error('Error occurred while retrieving group data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

