# 搶修排班表

純前端排班月曆，依使用者提供的 8 月每日樣本循環產生日期、人員與未來年度排班。

## 使用

直接開啟 `index.html` 即可。姓名會儲存在瀏覽器 localStorage；可用瀏覽器列印功能另存 PDF。

## 排程規則

目前以 8/1 為錨點，將提供的 8/1–8/31 轉成 31 日樣本並循環套用。若確認有不同的跨月規則，修改 `script.js` 的 `augustTemplate` 即可。

## GitHub Pages

將檔案推送到 GitHub 後，在 repository 的 Settings → Pages 選擇 `Deploy from a branch`、`main` 與 `/ (root)`，即可發佈。
