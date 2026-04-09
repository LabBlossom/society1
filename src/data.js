const ASSETS = {
  homeHero: "./assets/home.jpg",
  provinceHeroFallback: "./assets/province.jpg",
  cityHeroFallback: "./assets/city.jpg",
};

const REGION_META = [
  ["beijing", "北京", "北京市", "北京市"],
  ["tianjin", "天津", "天津市", "天津市"],
  ["shanghai", "上海", "上海市", "上海市"],
  ["chongqing", "重庆", "重庆市", "重庆市"],
  ["hebei", "河北", "河北省", "石家庄市"],
  ["henan", "河南", "河南省", "郑州市"],
  ["yunnan", "云南", "云南省", "昆明市"],
  ["liaoning", "辽宁", "辽宁省", "沈阳市"],
  ["heilongjiang", "黑龙江", "黑龙江省", "哈尔滨市"],
  ["hunan", "湖南", "湖南省", "长沙市"],
  ["anhui", "安徽", "安徽省", "合肥市"],
  ["shandong", "山东", "山东省", "济南市"],
  ["xinjiang", "新疆", "新疆维吾尔自治区", "乌鲁木齐市"],
  ["jiangsu", "江苏", "江苏省", "南京市"],
  ["zhejiang", "浙江", "浙江省", "杭州市"],
  ["jiangxi", "江西", "江西省", "南昌市"],
  ["hubei", "湖北", "湖北省", "武汉市"],
  ["guangxi", "广西", "广西壮族自治区", "南宁市"],
  ["gansu", "甘肃", "甘肃省", "兰州市"],
  ["shanxi", "山西", "山西省", "太原市"],
  ["neimenggu", "内蒙古", "内蒙古自治区", "呼和浩特市"],
  ["shanxi1", "陕西", "陕西省", "西安市"],
  ["jilin", "吉林", "吉林省", "长春市"],
  ["fujian", "福建", "福建省", "福州市"],
  ["guizhou", "贵州", "贵州省", "贵阳市"],
  ["guangdong", "广东", "广东省", "广州市"],
  ["qinghai", "青海", "青海省", "西宁市"],
  ["xizang", "西藏", "西藏自治区", "拉萨市"],
  ["sichuan", "四川", "四川省", "成都市"],
  ["ningxia", "宁夏", "宁夏回族自治区", "银川市"],
  ["hainan", "海南", "海南省", "海口市"],
  ["taiwan", "台湾", "台湾省", "台北市"],
  ["xianggang", "香港", "香港特别行政区", "香港"],
  ["aomen", "澳门", "澳门特别行政区", "澳门"],
];

const CATEGORY_TEMPLATES = [
  {
    id: "intangible",
    title: "非遗文化",
    desc: "整理当地非遗名录、传承人、展演时间与申报信息。",
  },
  {
    id: "minority",
    title: "少数民族文化",
    desc: "展示民族节庆、服饰、工艺、音乐和民俗活动。",
  },
  {
    id: "reading",
    title: "便民读书",
    desc: "社区读书角、公益讲座、图书漂流、亲子阅读活动。",
  },
  {
    id: "tourism",
    title: "旅游资料",
    desc: "本地景区导览、交通信息、季节推荐和路线攻略。",
  },
  {
    id: "volunteer",
    title: "志愿者报名",
    desc: "活动志愿岗位发布、报名、审核和服务时长统计。",
  },
  {
    id: "theater",
    title: "剧院演出",
    desc: "戏曲、舞台剧、音乐会档期，在线预约与座位信息。",
  },
];

function normalizeSeed(s) {
  return s.replace(/\s+/g, "").toLowerCase();
}

const PROVINCE_HERITAGE_KEYWORDS = {
  北京: "beijing forbidden city chinese opera heritage",
  天津: "tianjin yangliuqing new year painting heritage",
  上海: "shanghai jiangnan silk heritage culture",
  重庆: "chongqing sichuan opera face changing heritage",
  河北: "hebei cangzhou martial arts heritage culture",
  河南: "henan shaolin kung fu luoyang heritage",
  云南: "yunnan dali bai tie dye intangible heritage",
  辽宁: "liaoning manchu paper cutting heritage",
  黑龙江: "heilongjiang ethnic folk culture heritage",
  湖南: "hunan xiang embroidery intangible heritage",
  安徽: "anhui huizhou architecture huangmei opera heritage",
  山东: "shandong confucius qilu culture heritage",
  新疆: "xinjiang uyghur muqam dance heritage",
  江苏: "jiangsu suzhou kunqu embroidery heritage",
  浙江: "zhejiang yue opera longquan celadon heritage",
  江西: "jiangxi jingdezhen porcelain heritage",
  湖北: "hubei chu culture han embroidery heritage",
  广西: "guangxi zhuang brocade folk song heritage",
  甘肃: "gansu dunhuang mural silk road heritage",
  山西: "shanxi pingyao ancient architecture heritage",
  内蒙古: "inner mongolia morin khuur grassland heritage",
  陕西: "shaanxi qinqiang opera terracotta heritage",
  吉林: "jilin korean ethnic dance heritage",
  福建: "fujian nanyin tulou heritage culture",
  贵州: "guizhou miao embroidery batik heritage",
  广东: "guangdong cantonese opera lion dance heritage",
  青海: "qinghai tibetan thangka heritage culture",
  西藏: "tibet thangka tibetan opera heritage",
  四川: "sichuan shu embroidery opera heritage",
  宁夏: "ningxia hui ethnic culture heritage",
  海南: "hainan li brocade intangible heritage",
  台湾: "taiwan temple culture traditional craft heritage",
  香港: "hong kong cantonese opera intangible heritage",
  澳门: "macau druken dragon dance heritage",
};

function buildProvincePhoto(provinceMapName) {
  const keyword = encodeURIComponent(
    PROVINCE_HERITAGE_KEYWORDS[provinceMapName] || `${provinceMapName} chinese intangible heritage culture`,
  );
  return `https://source.unsplash.com/1600x900/?${keyword}`;
}

function buildCityPhoto(cityName) {
  const keyword = encodeURIComponent(`${cityName} china culture city landmark`);
  return `https://source.unsplash.com/1400x900/?${keyword}`;
}

const DB = {
  provinces: REGION_META.map(([id, mapName, fullName, capital]) => ({
    id,
    mapName,
    name: fullName,
    heroImage: buildProvincePhoto(mapName),
    cities: [
      {
        id: normalizeSeed(capital),
        name: capital,
        heroImage: buildCityPhoto(capital),
        categories: CATEGORY_TEMPLATES.map((item) => ({
          ...item,
          stats: {
            total: 80 + Math.floor(Math.random() * 150),
            signed: 10 + Math.floor(Math.random() * 70),
          },
        })),
      },
    ],
  })),
};

function getProvinceById(provinceId) {
  return DB.provinces.find((p) => p.id === provinceId) || null;
}

function getCityById(provinceId, cityId) {
  const p = getProvinceById(provinceId);
  if (!p) return null;
  return p.cities.find((c) => c.id === cityId) || null;
}

function getActivityById(provinceId, cityId, activityId) {
  const c = getCityById(provinceId, cityId);
  if (!c) return null;
  return c.categories.find((a) => a.id === activityId) || null;
}

window.AppData = {
  ASSETS,
  DB,
  CATEGORY_TEMPLATES,
  buildProvincePhoto,
  buildCityPhoto,
  getProvinceById,
  getCityById,
  getActivityById,
};

