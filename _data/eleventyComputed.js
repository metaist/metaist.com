// Global computed attributes

const parseDate = (attr) => (data) =>
  data[attr] ? new Date(data[attr]) : data.page.date;

module.exports = {
  created: parseDate("created"),
  updated: parseDate("updated"),
};
