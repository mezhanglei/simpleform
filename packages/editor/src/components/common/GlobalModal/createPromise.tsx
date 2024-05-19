import React from 'react';
import { createRoot } from 'react-dom/client';

// default Provider
let Container = ({ children }) => <>{children}</>;

/**
 * init promise-modal
 * @param {element} CustomContainer
 */
export const initPromiseModal = (CustomContainer) => {
  Container = CustomContainer || Container;
};

// 渲染弹窗组件到根节点
const renderModal = (Template, props) => {
  const dom = document.createElement('div');
  dom.setAttribute('class', 'portal-instance-container');
  document.body.appendChild(dom);
  const template = (
    <Container>
      <Template {...props} />
    </Container>
  );
  createRoot(dom).render(template);
  return dom;
};

export const create = async (Template, data = {}, options: { unmountDelay?: number } = {}) => {
  let instance: Node | null = null;

  // unmount
  const unmountedNode = () => {
    setTimeout(() => {
      if (instance) {
        document.body.removeChild(instance);
      }
    }, options.unmountDelay || 0);
  };

  const p = new Promise((resolve, reject) => {
    const props = {
      onResolve: resolve,
      onReject: reject,
      ...data,
    };
    instance = renderModal(Template, props);
  });

  // callbackResolve
  const callbackResolve = (val) => {
    unmountedNode();
    return Promise.resolve(val);
  };

  // callbackReject
  const callbackReject = (err) => {
    unmountedNode();
    return Promise.reject(err);
  };

  return p.then(callbackResolve, callbackReject).catch((err) => err);
};
