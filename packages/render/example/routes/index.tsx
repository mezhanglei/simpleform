import React, { useLayoutEffect, useState } from "react";
import { Router, Routes, Route, RouteProps } from "react-router-dom";
import { DemoRoutes } from "./demo";
import history from './history';

// 自定义Router
const CustomRouter = ({ history, ...props }) => {
  const [state, setState] = useState({
    action: history.action,
    location: history.location
  });

  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      {...props}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
};

export type CustomRouteProps = RouteProps & {
  auth?: boolean; // 是否需要权限验证
  component: React.ComponentType<any>; // 组件
  animationConfig?: { // 组件切换的动画类
    enter: string;
    exit: string;
  };
}

// 路由配置
const routes = [
  ...DemoRoutes,
];

// 路由组件
export default function RouteComponent() {

  return (
    <CustomRouter history={history}>
      <Routes>
        {
          routes.map((item: CustomRouteProps, index) => (<Route {...item} element={<item.component />} key={index} />))
        }
      </Routes>
    </CustomRouter>
  );
}
