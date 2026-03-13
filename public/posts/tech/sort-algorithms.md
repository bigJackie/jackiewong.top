---
title: 十大排序算法
category: tech
date: 2021-04-23
---

[toc]

# 十大排序算法

## 冒泡排序

### 效率

- 平均时间复杂度 O($n^{2}$)
- 最好情况O($n$)
- 最坏情况O($n^2$)
- 空间复杂度O(1)

### 步骤

1. 比较两个相邻元素，若前一个比后一个大，则相互交换
2. 依次比较数组中的每一对相邻元素，最后的元素为最大的
3. 重复上述操作直到排序完成

```js
function bubble_sort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      // es6 解构赋值
      arr[j] > arr[j + 1] ? ([arr[j + 1], arr[j]] = [arr[j], arr[j + 1]]) : null
    }
  }
  return arr
}
```

## 选择排序

### 效率

- 平均时间复杂度 O($n^{2}$)
- 最好情况O($n^2$)
- 最坏情况O($n^2$)
- 空间复杂度O(1)

### 步骤

1. 找到数组中最小（大）元素，和数组未排序序列的起始位置元素交换
2. 在剩余未排序元素中重复1的操作直到排序完成

```js
function select_sort(arr) {
  let min_idx // 最小数下标
  for (let i = 0; i < arr.length - 1; i++) {
    min_idx = i
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min_idx]) min_idx = j
    }
    ;[arr[min_idx], arr[i]] = [arr[i], arr[min_idx]]
  }
  return arr
}
```

## 插入排序

### 效率

- 平均时间复杂度 O($n^{2}$)
- 最好情况O($n$)
- 最坏情况O($n^2$)
- 空间复杂度O(1)

### 步骤

1. 依次扫描数组中未排序序列元素，对于每一个元素，依次和前一个元素比较，若比前一个元素小（大），则将当前位置元素赋值为前一个元素，再接着向前比较直到此元素比上一个元素大（小）

```js
function insert_sort(arr) {
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i] // 当前元素
    let pre_idx = i - 1 // 上一个元素下标
    while (pre_idx >= 0 && arr[pre_idx] > current) {
      arr[pre_idx + 1] = arr[pre_idx]
      pre_idx--
    }
    arr[pre_idx + 1] = current
  }
  return arr
}
```

## 希尔排序

### 效率

- 平均时间复杂度 O($nlog^2n$)
- 最好情况O($nlog^2n$)
- 最坏情况O($nlog^2n$)
- 空间复杂度O(1)

### 步骤

1. 插入排序的优化版本
2. 依次将数组分为（n/2, n/4, ... , 1）个序列分别进行插入排序（n为数组的长度）
3. 当最后只剩一个序列时，就是一般的插入排序

```js
function shell_sort(arr) {
  for (let step = parseInt(arr.length / 2); step > 0; step = parseInt(step / 2)) {
    for (let i = step; i < arr.length; i++) {
      const current = arr[i]
      let pre_idx = i
      while (pre_idx - step >= 0 && arr[pre_idx - step] > current) {
        arr[pre_idx] = arr[pre_idx - step]
        pre_idx = pre_idx - step
      }
      arr[pre_idx] = current
    }
  }
  return arr
}
```

## 归并排序

### 效率

- 平均时间复杂度 O($nlogn$)
- 最好情况O($nlogn$)
- 最坏情况O($nlogn$)
- 空间复杂度O($n$)

### 效率

- 平均时间复杂度 O($nlogn$)
- 最好情况O($nlogn$)
- 最坏情况O($nlogn$)
- 空间复杂度O(1)

### 步骤

1. 将数组使用递归的方式对半拆分，参数为拆分的数组的左索引和右索引
2. (左索引 + 右索引) / 2 = 中间值索引，放入递归中继续对半拆分
3. 递归回溯时将子数组排序
4. 创建新的数组空间，存放排序后的数组

```js
function merge_sort(arr) {
  if (arr.length < 2) return arr // 数组长度小于2时，无需排序直接返回
  const mid_idx = parseInt(arr.length / 2), // 中间值索引
    left = arr.slice(0, mid_idx), // 左子序列
    right = arr.slice(mid_idx) // 有子序列
  return merge_recursive(merge(left), merge(right))
}

function merge_recursive(left, right) {
  const res = []
  // 先反向排序，因为pop()时间效率比shift()高
  while (left.length && right.length) {
    left[left.length - 1] > right[right.length - 1] ? res.push(left.pop()) : res.push(right.pop())
  }
  while (left.length) res.push(left.pop())
  while (right.length) res.push(right.pop())
  // 最后返回数组的逆序，使其排序正常
  return res.reverse()
}
```

## 快速排序

### 效率

- 平均时间复杂度 O($nlogn$)
- 最好情况O($nlogn$)
- 最坏情况O($n^2$)
- 空间复杂度O($logn$)

### 步骤

1. 数组中选一个基准元素（通常为第一个）
2. 遍历数组，将小于基准的放在基准元素前，大于的放在后，一次遍历后基准值出现在数组中间
3. 递归将小于基准的序列和大于基准的序列重复步骤1,2进行排序

```js
function quick_sort(arr) {
  quick_recursive(arr, 0, arr.length - 1)
  return arr
}

function quick_recursive(arr, begin, end) {
  if (begin >= end) return
  let left = begin,
    right = end
  const pivot = arr[left] // 基准值
  while (left < right) {
    while (left < right && pivot < arr[right]) right--
    if (left < right) {
      arr[left] = arr[right]
      left++
    }
    while (left < right && pivot > arr[left]) left++
    if (left < right) {
      arr[right] = arr[left]
      right--
    }
  }
  arr[left] = pivot
  quick_recursive(arr, begin, left - 1)
  quick_recursive(arr, left + 1, end)
}
```

## 堆排序

### 效率

- 平均时间复杂度 O($nlogn$)
- 最好情况O($nlogn$)
- 最坏情况O($nlogn$)
- 空间复杂度O(1)

### 步骤

1. 将序列构造为一个大（小）顶堆
2. 将根节点和末节点元素互换
3. 将堆的大小减一，其余部分重复步骤1,2直到堆的大小为1

```js
function heap_sort(arr) {
  let len = arr.length - 1
  // 构造大顶堆
  for (let i = parseInt((len - 1) / 2); i >= 0; i--) {
    heap_recursive(arr, i, len)
  }
  for (let i = arr.length - 1; i > 0; i--) {
    ;[arr[i], arr[0]] = [arr[0], arr[i]] // 将最大值交换至末尾
    heap_recursive(arr, 0, --len)
  }
  return arr
}

function heap_recursive(arr, i, len) {
  let large = i
  if (arr[2 * i + 1] > arr[large] && 2 * i + 1 <= len) large = 2 * i + 1
  if (arr[2 * i + 2] > arr[large] && 2 * i + 2 <= len) large = 2 * i + 2
  if (large != i) {
    ;[arr[large], arr[i]] = [arr[i], arr[large]]
    heap_recursive(arr, large, len)
  }
}
```

## 计数排序

### 效率

- 平均时间复杂度 O($n+k$)
- 最好情况O($n+k$)
- 最坏情况O($n+k$)
- 空间复杂度O($k$)

### 步骤

## 桶排序

### 效率

- 平均时间复杂度 O($n+k$)
- 最好情况O($n+k$)
- 最坏情况O($n^2$)
- 空间复杂度O($n+k$)

### 步骤

## 基数排序

### 效率

- 平均时间复杂度 O($n*k$)
- 最好情况O($n*k$)
- 最坏情况O($n*k$)
- 空间复杂度O($n+k$)

### 步骤
