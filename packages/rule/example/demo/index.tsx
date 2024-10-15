import React from 'react';
import { Query, Builder, Preview } from '../../src';
// import '@simpleform/rule/lib/css/main.css';
import config from './config';

export default function Demo() {
  return (
    <Query config={config}>
      {(config, state, actions) => {
        return (
          <>
            <Preview config={config} tree={state}>
              {query => (
                <code className="query-preview">
                  {query || 'Use the builder below to create a search query.'}
                </code>
              )}
            </Preview>
            <div className="query-builder">
              <Builder config={config} tree={state} />
            </div>
          </>
        );
      }}
    </Query>
  );
}
