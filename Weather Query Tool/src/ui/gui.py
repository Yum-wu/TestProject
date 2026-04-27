import tkinter as tk
from tkinter import ttk, messagebox
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from datetime import datetime
from ..core.weather_service import WeatherService
from ..utils.config import ConfigManager
from ..utils.logger import Logger


class GUI:
    """
    图形化界面类
    """
    
    def __init__(self):
        """
        初始化图形化界面
        """
        try:
            self.logger = Logger.get_logger(__name__)
            self.logger.info("Initializing GUI...")
            
            self.config = ConfigManager()
            self.logger.info(f"Config loaded, API key: {self.config.get_api_key('openweather')[:5]}...")
            
            api_key = self.config.get_api_key('openweather')
            if not api_key or api_key == 'your_api_key_here':
                self.logger.warning("No valid API key found, using placeholder")
            
            self.weather_service = WeatherService(api_key=api_key)
            self.logger.info("WeatherService initialized")
            
            self.root = None
            self.logger.info("GUI initialization completed")
        except Exception as e:
            self.logger.error(f"Error during GUI initialization: {str(e)}")
            raise
    
    def run(self):
        """
        运行图形化界面
        """
        self.root = tk.Tk()
        self.root.title("天气查询工具")
        self.root.geometry("800x600")
        
        # 创建主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 创建顶部输入区域
        input_frame = ttk.LabelFrame(main_frame, text="查询参数", padding="10")
        input_frame.pack(fill=tk.X, pady=5)
        
        # 城市输入
        ttk.Label(input_frame, text="城市：").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        self.city_var = tk.StringVar()
        city_entry = ttk.Entry(input_frame, textvariable=self.city_var, width=30)
        city_entry.grid(row=0, column=1, padx=5, pady=5, sticky=tk.W)
        
        # 天数输入
        ttk.Label(input_frame, text="天数：").grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)
        self.days_var = tk.IntVar(value=5)
        days_spinbox = ttk.Spinbox(input_frame, from_=1, to=10, textvariable=self.days_var, width=5)
        days_spinbox.grid(row=0, column=3, padx=5, pady=5, sticky=tk.W)
        
        # 查询按钮
        button_frame = ttk.Frame(input_frame)
        button_frame.grid(row=0, column=4, padx=10, pady=5, sticky=tk.E)
        
        ttk.Button(button_frame, text="当前天气", command=self.get_current_weather).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="天气预报", command=self.get_forecast).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="天气趋势", command=self.get_trend).pack(side=tk.LEFT, padx=5)
        
        # 创建结果显示区域
        self.result_frame = ttk.LabelFrame(main_frame, text="结果", padding="10")
        self.result_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # 创建结果文本区域
        self.result_text = tk.Text(self.result_frame, height=10, wrap=tk.WORD)
        self.result_text.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # 创建图表区域
        self.chart_frame = ttk.LabelFrame(main_frame, text="图表", padding="10")
        self.chart_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.root.mainloop()
    
    def get_current_weather(self):
        """
        获取当前天气
        """
        city = self.city_var.get().strip()
        if not city:
            messagebox.showerror("错误", "请输入城市名称")
            return
        
        # 显示加载状态
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, "正在获取天气数据...")
        self.root.update()
        
        try:
            weather = self.weather_service.get_current_weather(city)
            self.display_current_weather(weather)
        except Exception as e:
            self.logger.error(f"Error getting current weather: {str(e)}")
            messagebox.showerror("错误", f"获取天气失败: {str(e)}")
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, "获取天气失败，请检查网络连接或API密钥")
    
    def get_forecast(self):
        """
        获取天气预报
        """
        city = self.city_var.get().strip()
        if not city:
            messagebox.showerror("错误", "请输入城市名称")
            return
        
        days = self.days_var.get()
        
        # 显示加载状态
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, "正在获取天气预报数据...")
        self.root.update()
        
        try:
            forecast = self.weather_service.get_forecast(city, days)
            self.display_forecast(forecast)
            self.plot_forecast(forecast)
        except Exception as e:
            self.logger.error(f"Error getting forecast: {str(e)}")
            messagebox.showerror("错误", f"获取天气预报失败: {str(e)}")
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, "获取天气预报失败，请检查网络连接或API密钥")
    
    def get_trend(self):
        """
        获取天气趋势
        """
        city = self.city_var.get().strip()
        if not city:
            messagebox.showerror("错误", "请输入城市名称")
            return
        
        days = self.days_var.get()
        
        # 显示加载状态
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, "正在获取天气趋势数据...")
        self.root.update()
        
        try:
            trend = self.weather_service.get_weather_trend(city, days)
            self.display_trend(trend)
            self.plot_trend(trend)
        except Exception as e:
            self.logger.error(f"Error getting trend: {str(e)}")
            messagebox.showerror("错误", f"获取天气趋势失败: {str(e)}")
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, "获取天气趋势失败，请检查网络连接或API密钥")
    
    def display_current_weather(self, weather):
        """
        显示当前天气
        
        Args:
            weather (WeatherData): 天气数据
        """
        self.result_text.delete(1.0, tk.END)
        result = f"=== {weather.city} 当前天气 ===\n"
        result += f"温度: {weather.temperature}°C\n"
        result += f"描述: {weather.description}\n"
        result += f"湿度: {weather.humidity}%\n"
        result += f"风速: {weather.wind_speed} m/s\n"
        result += f"日期: {weather.date.strftime('%Y-%m-%d %H:%M:%S')}\n"
        self.result_text.insert(tk.END, result)
    
    def display_forecast(self, forecast):
        """
        显示天气预报
        
        Args:
            forecast (list[WeatherData]): 天气预报数据列表
        """
        self.result_text.delete(1.0, tk.END)
        if not forecast:
            self.result_text.insert(tk.END, "无可用的预报数据")
            return
        
        result = f"=== {forecast[0].city} {len(forecast)}天天气预报 ===\n"
        for day in forecast:
            result += f"\n日期: {day.date.strftime('%Y-%m-%d')}\n"
            result += f"温度: {day.temperature}°C\n"
            result += f"描述: {day.description}\n"
            result += f"湿度: {day.humidity}%\n"
            result += f"风速: {day.wind_speed} m/s\n"
        self.result_text.insert(tk.END, result)
    
    def display_trend(self, trend):
        """
        显示天气趋势
        
        Args:
            trend (dict): 天气趋势数据
        """
        self.result_text.delete(1.0, tk.END)
        result = f"=== {trend['city']} 天气趋势 ===\n"
        result += f"天数: {trend['days']}\n"
        result += f"平均温度: {trend['avg_temperature']:.1f}°C\n"
        result += f"最高温度: {trend['max_temperature']:.1f}°C\n"
        result += f"最低温度: {trend['min_temperature']:.1f}°C\n"
        result += "\n温度趋势:\n"
        for i, temp in enumerate(trend['temperatures']):
            date = trend['dates'][i].strftime('%Y-%m-%d')
            result += f"{date}: {temp:.1f}°C - {trend['descriptions'][i]}\n"
        self.result_text.insert(tk.END, result)
    
    def plot_forecast(self, forecast):
        """
        绘制天气预报图表
        
        Args:
            forecast (list[WeatherData]): 天气预报数据列表
        """
        for widget in self.chart_frame.winfo_children():
            widget.destroy()
        
        if not forecast:
            return
        
        dates = [day.date.strftime('%Y-%m-%d') for day in forecast]
        temperatures = [day.temperature for day in forecast]
        
        fig, ax = plt.subplots(figsize=(8, 4))
        ax.plot(dates, temperatures, marker='o', linestyle='-')
        ax.set_title(f"{forecast[0].city} 温度预报")
        ax.set_xlabel('日期')
        ax.set_ylabel('温度 (°C)')
        ax.grid(True)
        
        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
    
    def plot_trend(self, trend):
        """
        绘制天气趋势图表
        
        Args:
            trend (dict): 天气趋势数据
        """
        for widget in self.chart_frame.winfo_children():
            widget.destroy()
        
        dates = [date.strftime('%Y-%m-%d') for date in trend['dates']]
        temperatures = trend['temperatures']
        
        fig, ax = plt.subplots(figsize=(8, 4))
        ax.plot(dates, temperatures, marker='o', linestyle='-')
        ax.set_title(f"{trend['city']} 温度趋势")
        ax.set_xlabel('日期')
        ax.set_ylabel('温度 (°C)')
        ax.grid(True)
        
        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)