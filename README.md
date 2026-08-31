# 搶修排班表

純前端排班月曆，依使用者提供的 8 月排班規則產生日期、人員與未來年度排班。

## 使用

直接開啟 `index.html` 即可。姓名會儲存在瀏覽器 localStorage；可用瀏覽器列印功能另存 PDF。

## 排程規則

目前規則：平日一到五每週輪一位，順序為 B、C、D、A；週六順序為 A、C，週日順序為 B、D，每組連續兩週。基準為 2026/8/1（六）與 2026/8/3（一）。

## GitHub Pages

將檔案推送到 GitHub 後，在 repository 的 Settings → Pages 選擇 `Deploy from a branch`、`main` 與 `/ (root)`，即可發佈。
