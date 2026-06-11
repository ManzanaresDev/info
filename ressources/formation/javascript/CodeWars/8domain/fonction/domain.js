// domain.js
export function domain(url) {
  if (typeof url !== "string") {
    throw new Error("bad input type");
  }
  const prefix1 = /^http:\/\//;
  const prefix2 = /^https:\/\//;
  const prefix3 = /^http:\/\/www\./;
  const prefix4 = /^https:\/\/www\./;
  const prefix5 = /^www\./;
  clear;
  let domain = "";
  let posPoint;

  if (prefix5.test(url)) {
    posPoint = url.indexOf(".", 4);
    domain = url.substring(4, posPoint);
    return domain;
  }

  if (prefix4.test(url)) {
    posPoint = url.indexOf(".", 12);
    domain = url.substring(12, posPoint);
    return domain;
  }

  if (prefix3.test(url)) {
    posPoint = url.indexOf(".", 11);
    domain = url.substring(11, posPoint);
    return domain;
  }

  if (prefix1.test(url)) {
    posPoint = url.indexOf(".", 7);
    domain = url.substring(7, posPoint);
    return domain;
  }

  if (prefix2.test(url)) {
    posPoint = url.indexOf(".", 8);
    domain = url.substring(8, posPoint);
    return domain;
  }

  // pas de prefixe trouvé
  posPoint = url.indexOf(".", 0);
  domain = url.substring(0, posPoint);
  return domain;
}

// export function domain(url) {
//   if (typeof url !== "string") {
//     throw new Error("bad input type");
//   }
//   const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\.]+)/i);
//   return match ? match[1] : "";
// }
