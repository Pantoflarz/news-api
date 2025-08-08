class NewsController {

  constructor(responseJson) {
    this.responseJson = responseJson;
  }

  async dashboard_get(req, res, next) {
    const news = res.locals.cache.get("news");

    if (!news) {
      return res.status(404).send(this.responseJson("error", "News not found"));
    }

    res.status(200).send(this.responseJson("OK", news));
  }
}

module.exports = NewsController;
