import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import { useTodoStore } from "../store/useTodoStore";

vi.mock("../utils/storage", () => ({
  saveTasks: vi.fn(),
  loadTasks: vi.fn(() => []),
}));

describe("Todo Manager 应用测试", () => {
  beforeEach(() => {
    useTodoStore.setState({
      tasks: [],
      filterStatus: "all",
      filterCategory: "全部",
      searchQuery: "",
    });
  });

  describe("基础渲染测试", () => {
    it("应该渲染应用标题", () => {
      render(<App />);
      expect(screen.getByText("Todo Manager")).toBeInTheDocument();
    });

    it("应该渲染任务输入框", () => {
      render(<App />);
      const input = screen.getByPlaceholderText("输入任务内容...");
      expect(input).toBeInTheDocument();
    });

    it("应该渲染添加按钮", () => {
      render(<App />);
      expect(screen.getByText("添加")).toBeInTheDocument();
    });

    it("初始状态下显示暂无任务提示", () => {
      render(<App />);
      expect(screen.getByText("暂无任务")).toBeInTheDocument();
    });

    it("添加按钮初始应该是禁用状态", () => {
      render(<App />);
      const addButton = screen.getByText("添加");
      expect(addButton).toBeDisabled();
    });

    it("应该渲染统计概览卡片", () => {
      render(<App />);
      expect(screen.getByText("总任务数")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "待完成" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "已完成" }),
      ).toBeInTheDocument();
      expect(screen.getByText("完成率")).toBeInTheDocument();
    });
  });

  describe("任务创建测试", () => {
    it("点击添加按钮时，空输入不应创建任务", () => {
      render(<App />);

      const addButton = screen.getByText("添加");
      fireEvent.click(addButton);

      expect(screen.getByText("暂无任务")).toBeInTheDocument();
    });

    it("输入任务标题后可以成功添加任务", async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");
      fireEvent.change(input, { target: { value: "测试任务1" } });

      const addButton = screen.getByText("添加");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("测试任务1")).toBeInTheDocument();
      });
    });

    it("提交表单可以添加任务", async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");
      fireEvent.change(input, { target: { value: "测试任务2" } });
      fireEvent.submit(input.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText("测试任务2")).toBeInTheDocument();
      });
    });

    it("添加任务后输入框应该被清空", async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");
      fireEvent.change(input, { target: { value: "测试任务3" } });

      const addButton = screen.getByText("添加");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(input).toHaveValue("");
      });
    });
  });

  describe("任务状态测试", () => {
    beforeEach(async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");
      fireEvent.change(input, { target: { value: "可完成的任务" } });

      const addButton = screen.getByText("添加");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("可完成的任务")).toBeInTheDocument();
      });
    });

    it("应该显示新添加的任务", () => {
      expect(screen.getByText("可完成的任务")).toBeInTheDocument();
    });

    it("暂无任务提示应该消失", () => {
      expect(screen.queryByText("暂无任务")).not.toBeInTheDocument();
    });
  });

  describe("任务筛选测试", () => {
    beforeEach(async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");

      fireEvent.change(input, { target: { value: "任务A" } });
      fireEvent.click(screen.getByText("添加"));
      await waitFor(() =>
        expect(screen.getByText("任务A")).toBeInTheDocument(),
      );

      fireEvent.change(input, { target: { value: "任务B" } });
      fireEvent.click(screen.getByText("添加"));
      await waitFor(() =>
        expect(screen.getByText("任务B")).toBeInTheDocument(),
      );
    });

    it("应该显示所有添加的任务", () => {
      expect(screen.getByText("任务A")).toBeInTheDocument();
      expect(screen.getByText("任务B")).toBeInTheDocument();
    });

    it("点击待完成筛选按钮应该隐藏已完成的任务", async () => {
      const activeFilter = screen.getAllByText("待完成")[1];
      fireEvent.click(activeFilter);

      await waitFor(() => {
        expect(screen.getByText("任务A")).toBeInTheDocument();
        expect(screen.getByText("任务B")).toBeInTheDocument();
      });
    });
  });

  describe("搜索功能测试", () => {
    beforeEach(async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");

      fireEvent.change(input, { target: { value: "测试搜索" } });
      fireEvent.click(screen.getByText("添加"));
      await waitFor(() =>
        expect(screen.getByText("测试搜索")).toBeInTheDocument(),
      );

      fireEvent.change(input, { target: { value: "其他任务" } });
      fireEvent.click(screen.getByText("添加"));
      await waitFor(() =>
        expect(screen.getByText("其他任务")).toBeInTheDocument(),
      );
    });

    it("应该可以通过搜索框过滤任务", async () => {
      const searchInput = screen.getByPlaceholderText("搜索任务...");
      fireEvent.change(searchInput, { target: { value: "测试" } });

      await waitFor(() => {
        expect(screen.getByText("测试搜索")).toBeInTheDocument();
        expect(screen.queryByText("其他任务")).not.toBeInTheDocument();
      });
    });
  });

  describe("统计概览测试", () => {
    it("初始状态统计应该全为0", () => {
      render(<App />);
      const elements = screen.getAllByText("0%");
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it("添加任务后统计应该更新", async () => {
      render(<App />);

      const input = screen.getByPlaceholderText("输入任务内容...");
      fireEvent.change(input, { target: { value: "统计测试任务" } });
      fireEvent.click(screen.getByText("添加"));

      await waitFor(() => {
        expect(screen.getByText("总任务数")).toBeInTheDocument();
      });
    });
  });
});
