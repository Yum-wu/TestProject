#!/usr/bin/env python3
"""
Weather Query Tool - Main Entry Point
"""

import sys
from src.ui.cli import CLI
from src.utils.logger import Logger


def main():
    """
    主函数
    """
    # 初始化日志
    logger = Logger.get_logger(__name__)
    logger.info("Starting Weather Query Tool")
    
    try:
        # 创建并运行CLI
        cli = CLI()
        cli.run()
    except KeyboardInterrupt:
        logger.info("Program interrupted by user")
        print("\nProgram interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        print(f"Error: {str(e)}")
        sys.exit(1)
    finally:
        logger.info("Program exited")


if __name__ == "__main__":
    main()