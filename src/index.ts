const doc = document;
const css = `
.spacing-container div {
  box-sizing: border-box;
}
.spacing-container.hide-value .spacing-rect-value{
  opacity: .3;
}
.spacing-rect {
  pointer-events: none;
  box-sizing: border-box;
  position: fixed;
  border: 1px solid transparent;
  border-radius: 0 2px 2px 2px;
  z-index: 999;
}
.spacing-rect-red {
  border-color: #fd68af;
}
.spacing-rect-red > .spacing-rect-value {
  background-color: #fd68af;
}
.spacing-rect-blue {
  border-color: #1492ff;
}
.spacing-rect-blue > .spacing-rect-value {
  background-color: #1492ff;
}
.spacing-rect > .spacing-rect-value {
  position: fixed;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  padding: 0 4px;
}
.spacing-line {
  position: fixed;
  pointer-events: none;
  z-index: 99;
}
.spacing-line-horizontal  {
  height: 1px;
  border-bottom-width: 1px;
}
.spacing-line-vertical {
  height: 1px;
  border-left-width: 1px;
}
.spacing-line-blue {
  border-color: #1492ff;
}
.spacing-line-red {
  border-color: #fd68af;
}
.spacing-line-green {
  border-color: green;
}
.spacing-line-val {
  color: #fff;
  pointer-events: none;
  position: fixed;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  padding: 0 4px;
  border-radius: 8px;
  transform: translate3d(-50%,-50%,0);
  z-index: 9999;
}
.spacing-line-val-blue {
  background-color: #1492ff;
}
.spacing-line-val-red {
  background-color: #fd68af;
}
.spacing-line-val-green {
  background-color: green;
}
`;

// 当前元素
let currentEl: HTMLElement = doc.body;
// 源元素
let sourceEl: HTMLElement | null = null;
// 目标元素
let targetEl: HTMLElement | null = null;
// 是否按下触发按钮
let isPress = false;
// 用于绘制的DOM，0是源元素，1是目标元素，后面是线条
let elements: HTMLElement[] = [];
// 插入CSS
const style = doc.createElement("style");
style.innerHTML = css;
doc.head.appendChild(style);
// 插入容器
let container = document.createElement("div");
container.className = "spacing-container";
document.body.appendChild(container);
// 绘制
const render = () => {
  container.innerHTML = "";
  let frg = doc.createDocumentFragment();
  if (elements.length > 2) {
    container.classList.add("hide-value");
  } else {
    container.classList.remove("hide-value");
  }
  elements.forEach((el) => {
    frg.appendChild(el);
  });
  container.appendChild(frg);
};

type Coord = {
  x: number;
  y: number;
  dir: "top" | "right" | "bottom" | "left";
};

// 绘制矩形框显示尺寸信息
const drawRect = (
  { width, height, top, left }: DOMRect,
  color: "red" | "blue"
): HTMLDivElement => {
  let el = doc.createElement("div");
  el.classList.add("spacing-rect");
  el.classList.add(`spacing-rect-${color}`);
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  let value = doc.createElement("div");
  value.classList.add("spacing-rect-value");
  value.textContent = `${Math.floor(width)}px × ${Math.floor(height)}px`;
  value.style.top = top >= 0 ? (top >= 20 ? `${top - 18}px` : `${top}px`) : `0`;
  value.style.left = `${left < 0 ? 0 : left}px`;
  value.style.borderRadius = top <= 20 ? "0 0 2px 2px" : "2px 2px 0 0";
  el.appendChild(value);
  return el;
};

// 绘制直线、虚线、不同颜色、可显示数值
const drawLine = ({
  x,
  y,
  width,
  height,
  type,
  showValue,
  color,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  type: "solid" | "dashed";
  color: "blue" | "red" | "green";
  showValue?: boolean;
}): HTMLDivElement[] => {
  let doms: HTMLDivElement[] = [];
  let isHorizontal = width !== undefined;
  let line = doc.createElement("div");
  doms.push(line);
  line.classList.add(
    "spacing-line",
    `spacing-line-${color}`,
    `spacing-line-${isHorizontal ? "horizontal" : "vertical"}`
  );
  line.style.top = `${y}px`;
  line.style.left = `${x}px`;
  let top: number;
  let left: number;
  // 横线
  if (isHorizontal) {
    line.style.width = `${width}px`;
    line.style.borderBottomStyle = type;
    top = y;
    left = x + width! / 2;
  } else {
    line.style.height = `${height}px`;
    line.style.borderLeftStyle = type;
    top = y + height! / 2;
    left = x;
  }
  if (showValue) {
    let val = doc.createElement("div");
    val.classList.add("spacing-line-val", `spacing-line-val-${color}`);
    val.textContent = `${Math.floor(isHorizontal ? width! : height!)}px`;
    if (y < 0) {
      val.style.top = "0";
      val.style.transform = "translateX(-50%)";
    } else {
      val.style.top = `${top}px`;
    }
    if (x < 0) {
      val.style.left = "0";
      val.style.transform = "translateY(-50%)";
    } else {
      val.style.left = `${left}px`;
    }
    doms.push(val);
  }
  return doms;
};

// 将DOM坐标转换为每个线条坐标（上、右、下、左）
const rectToPos = ({ left, top, right, bottom }: DOMRect): Coord[][] => {
  let topLine: Coord[] = [
    { x: left, y: top, dir: "top" },
    { x: right, y: top, dir: "top" },
  ];
  let rightLine: Coord[] = [
    { x: right, y: top, dir: "right" },
    { x: right, y: bottom, dir: "right" },
  ];
  let bottomLine: Coord[] = [
    { x: left, y: bottom, dir: "bottom" },
    { x: right, y: bottom, dir: "bottom" },
  ];
  let leftLine: Coord[] = [
    { x: left, y: top, dir: "left" },
    { x: left, y: bottom, dir: "left" },
  ];
  return [topLine, rightLine, bottomLine, leftLine];
};

/**
 * 统一逻辑，比较两个矩形上下线条来判断是否可以连接
 * 判断主体是source.top
 * 返回source与target连接线条数组
 */
const getLinked = (
  source: {
    top: Coord[];
    bottom: Coord[];
  },
  target: {
    top: Coord[];
    bottom: Coord[];
  },
  index: number
): Coord[][] | void => {
  let s = [];
  let t = [];
  let x = 9999999;
  if (index === 1) {
    s = [x - source.top[0].x, x - source.bottom[0].x];
    t = [x - target.top[0].x, x - target.bottom[0].x];
  } else if (index === 2) {
    s = [x - source.top[0].y, x - source.bottom[0].y];
    t = [x - target.top[0].y, x - target.bottom[0].y];
  } else if (index === 3) {
    s = [source.top[0].x, source.bottom[0].x];
    t = [target.top[0].x, target.bottom[0].x];
  } else {
    s = [source.top[0].y, source.bottom[0].y];
    t = [target.top[0].y, target.bottom[0].y];
  }
  if (s[0] > t[1]) {
    return [source.top, target.bottom];
  } else if (t[0] < s[1] && t[0] !== s[0] && t[1] !== s[0]) {
    return [source.top, target.top];
  }
};

const xOry = (k: string) => (k === "x" ? "y" : "x");

const correction = (e: Coord, v: number) =>
  ["right", "bottom"].includes(e.dir) ? v - 1 : v;

// 根据两条线坐标计算相连线条坐标
const computeLinePos = ([source, target]: Coord[][]) => {
  let doms = [];
  let isHorizontal: boolean = source[0].y === source[1].y;
  // 横线取x，竖线取y
  let k: "x" | "y" = isHorizontal ? "x" : "y";
  // 偏移值小的为min，方便后续计算
  let [minPos, maxPos] =
    source[0][k] < target[0][k] ? [source, target] : [target, source];

  let diff = maxPos[0][k] - minPos[0][k];
  let isIntersect = diff < minPos[1][k] - minPos[0][k];

  if (isIntersect) {
    /**
     * 相交
     * 规律：显示距离的线条总是在相交范围中间
     */
    // 两条线段另一个轴的距离
    let dist = maxPos[0][xOry(k)] - minPos[0][xOry(k)];
    // 原点到相交区域距离
    let n = minPos[0][k] + diff;
    // 距离原点最近的线条末端距离
    let minY = Math.min(source[1][k], target[1][k]);
    // 计算最终坐标
    let x = n + (minY - n) / 2;
    let y = dist > 0 ? minPos[0][xOry(k)] : maxPos[0][xOry(k)];
    doms.push(
      ...drawLine({
        x: isHorizontal ? x : y,
        y: isHorizontal ? y : x,
        [isHorizontal ? "height" : "width"]: Math.abs(dist),
        color: "blue",
        type: "solid",
        showValue: true,
      })
    );
  } else {
    /**
     * 不相交
     * 规律：source在上时距离显示在y值小的一方，source在下方时距离显示在y值大的一方
     * 线条永远在线段中，同时在另一个线条上绘制虚线连接距离线条
     */
    // let sourceWidth = source[1][k] - source[0][k];
    // let targetWidth = target[1][k] - target[0][k];

    let dist = Math.abs(target[0][xOry(k)] - source[0][xOry(k)]);
    let x: number;
    let y: number;
    let dx: number;
    let dy: number;
    let sublineDist: number;

    if (isHorizontal) {
      let [minPos, maxPos] =
        target[0].y < source[0].y ? [source, target] : [target, source];
      if (["right", "bottom"].includes(source[0].dir)) {
        [minPos, maxPos] = [maxPos, minPos];
      }
      let targetDir = maxPos[1].x <= minPos[0].x ? "left" : "right";
      x = minPos[0].x + (minPos[1].x - minPos[0].x) / 2;
      y = source[0].y > target[0].y ? target[0].y : source[0].y;
      dx = targetDir === "left" ? maxPos[1].x : x;
      dy = correction(maxPos[0], maxPos[0].y);
      sublineDist = targetDir === "left" ? x - maxPos[1].x : maxPos[0].x - x;
    } else {
      let [minPos, maxPos] =
        target[0].x < source[0].x ? [source, target] : [target, source];
      if (["right", "bottom"].includes(source[0].dir)) {
        [minPos, maxPos] = [maxPos, minPos];
      }
      y = minPos[0].y + (minPos[1].y - minPos[0].y) / 2;
      x = source[0].x > target[0].x ? target[0].x : source[0].x;
      let targetDir = maxPos[1].y <= minPos[0].y ? "top" : "bottom";
      dy = targetDir === "top" ? maxPos[1].y : y;
      dx = correction(maxPos[0], maxPos[0].x);
      sublineDist = targetDir === "top" ? y - maxPos[1].y : maxPos[0].y - y;
    }
    doms.push(
      ...drawLine({
        x,
        y,
        [isHorizontal ? "height" : "width"]: dist,
        color: "blue",
        type: "solid",
        showValue: true,
      })
    );
    doms.push(
      ...drawLine({
        x: dx,
        y: dy,
        [isHorizontal ? "width" : "height"]: sublineDist,
        color: "red",
        type: "dashed",
      })
    );
  }
  return doms;
};

const drawSpacing = (source: DOMRect, target: DOMRect) => {
  let lines: HTMLDivElement[] = [];
  // 绘制源元素四个方向的距离
  let sourceLinePos = rectToPos(source);
  let targetLinePos = rectToPos(target);
  for (let i = 0; i < 4; i++) {
    let bottomIndex = i + 2 > 3 ? i + 2 - 4 : i + 2;
    let linkedLine = getLinked(
      {
        top: sourceLinePos[i],
        bottom: sourceLinePos[bottomIndex],
      },
      {
        top: targetLinePos[i],
        bottom: targetLinePos[bottomIndex],
      },
      i
    );
    if (linkedLine) {
      lines.push(...computeLinePos(linkedLine));
    }
  }
  return lines;
};

const handleMouseOver = (ev: MouseEvent) => {
  currentEl = ev.target as HTMLElement;
  if (isPress) {
    // 清空上次绘制
    elements.splice(1);
    render();
    if (currentEl !== sourceEl) {
      targetEl = currentEl;
      // 绘制目标元素
      elements[1] = drawRect(targetEl.getBoundingClientRect(), "red");
      // 绘制线条
      elements.push(
        ...drawSpacing(
          sourceEl!.getBoundingClientRect(),
          targetEl!.getBoundingClientRect()
        )
      );
      render();
    }
  }
};

const handleScroll = (ev: Event) => {
  ev.preventDefault();
};
doc.addEventListener("mouseover", handleMouseOver);
doc.addEventListener("keydown", (ev) => {
  if (ev.altKey && !isPress) {
    isPress = true;
    sourceEl = currentEl;
    elements[0] = drawRect(sourceEl!.getBoundingClientRect(), "blue");
    window.addEventListener("wheel", handleScroll, { passive: false });
    render();
  }
});
doc.addEventListener("keyup", (ev) => {
  if (isPress) {
    isPress = false;
    window.removeEventListener("wheel", handleScroll);
    elements.splice(0);
    render();
  }
});

export {};
