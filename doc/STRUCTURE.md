├── wukong-profiler
  ├── bin
    ├── wukong-profiler       ← CLI wrapper
  ├── doc
  ├── src
    ├── api
      ├── testFunction.mjs
    ├── utils
      ├── diff.mjs              ← 前后性能差异检测
      ├── format.mjs            ← 时间格式化
      ├── profiler.mjs          ← core 核心实现
      ├── trace.mjs             ← Chrome Trace JSON 生成
    ├── index.mjs              ← 模块主入口
  ├── README.md                ← English
  ├── README.zh.md             ← 中文